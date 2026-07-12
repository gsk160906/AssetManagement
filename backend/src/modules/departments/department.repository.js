import pool from '../../db/index.js';
import { createNotification as centralCreateNotification } from '../notifications/notifications.service.js';

export const createDepartment = async (data) => {
  const { name, parent_id, manager_id, status } = data;
  const { rows } = await pool.query(
    `INSERT INTO departments (name, parent_id, manager_id, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, parent_id || null, manager_id || null, status || 'ACTIVE']
  );
  return rows[0];
};

export const updateDepartment = async (id, data) => {
  const fields = [];
  const values = [];

  Object.entries(data).forEach(([key, val]) => {
    fields.push(`${key} = $${fields.length + 1}`);
    values.push(val === undefined ? null : val);
  });

  if (fields.length === 0) return getDepartmentById(id);

  values.push(id);
  const query = `
    UPDATE departments 
    SET ${fields.join(', ')}, updated_at = NOW() 
    WHERE id = $${values.length} AND is_deleted = FALSE 
    RETURNING *`;
    
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const deleteDepartment = async (id) => {
  const { rows } = await pool.query(
    `UPDATE departments 
     SET is_deleted = TRUE, deleted_at = NOW() 
     WHERE id = $1 AND is_deleted = FALSE 
     RETURNING *`,
    [id]
  );
  return rows[0];
};

export const getDepartmentById = async (id) => {
  const query = `
    SELECT 
      d.*,
      p.name AS parent_name,
      u.name AS manager_name
    FROM departments d
    LEFT JOIN departments p ON d.parent_id = p.id
    LEFT JOIN users u ON d.manager_id = u.id
    WHERE d.id = $1 AND d.is_deleted = FALSE
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getDepartments = async (filters = {}) => {
  const { q = '', status = '' } = filters;
  const values = [];
  
  let query = `
    SELECT 
      d.id, d.name, d.parent_id, d.manager_id, d.status, d.created_at,
      p.name AS parent_name,
      u.name AS manager_name,
      COALESCE(COUNT(DISTINCT usr.id), 0) AS employee_count,
      COALESCE(COUNT(DISTINCT ast.id), 0) AS asset_count
    FROM departments d
    LEFT JOIN departments p ON d.parent_id = p.id
    LEFT JOIN users u ON d.manager_id = u.id
    LEFT JOIN users usr ON d.id = usr.department_id AND usr.is_deleted = FALSE
    LEFT JOIN assets ast ON d.id = ast.current_department_id AND ast.is_deleted = FALSE
    WHERE d.is_deleted = FALSE
  `;

  if (q) {
    values.push(`%${q}%`);
    query += ` AND (d.name ILIKE $${values.length} OR u.name ILIKE $${values.length})`;
  }

  if (status) {
    values.push(status);
    query += ` AND d.status = $${values.length}`;
  }

  query += `
    GROUP BY d.id, p.name, u.name
    ORDER BY d.name ASC
  `;

  const { rows } = await pool.query(query, values);
  return rows;
};

export const getDepartmentTree = async () => {
  const query = `
    WITH RECURSIVE dept_hierarchy AS (
      SELECT id, name, parent_id, status, manager_id, 1 AS level, ARRAY[name::text] AS path
      FROM departments
      WHERE parent_id IS NULL AND is_deleted = FALSE
      UNION ALL
      SELECT d.id, d.name, d.parent_id, d.status, d.manager_id, dh.level + 1, dh.path || d.name::text
      FROM departments d
      INNER JOIN dept_hierarchy dh ON d.parent_id = dh.id
      WHERE d.is_deleted = FALSE
    )
    SELECT h.*, u.name AS manager_name
    FROM dept_hierarchy h
    LEFT JOIN users u ON h.manager_id = u.id
    ORDER BY path;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getDepartmentStats = async () => {
  // Aggregate statistics for dashboard & sidebar distribution charts
  const query = `
    SELECT 
      d.id, d.name,
      COALESCE(COUNT(DISTINCT u.id), 0) AS employee_count,
      COALESCE(COUNT(DISTINCT a.id), 0) AS asset_count
    FROM departments d
    LEFT JOIN users u ON d.id = u.department_id AND u.is_deleted = FALSE
    LEFT JOIN assets a ON d.id = a.current_department_id AND a.is_deleted = FALSE
    WHERE d.is_deleted = FALSE AND d.status = 'ACTIVE'
    GROUP BY d.id, d.name
    ORDER BY asset_count DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getDepartmentEmployees = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, status
     FROM users
     WHERE department_id = $1 AND is_deleted = FALSE
     ORDER BY name ASC`,
    [id]
  );
  return rows;
};

export const getDepartmentAssets = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, asset_tag, serial_number, status, current_location, acquisition_cost
     FROM assets
     WHERE current_department_id = $1 AND is_deleted = FALSE
     ORDER BY name ASC`,
    [id]
  );
  return rows;
};

export const departmentExists = async (name, excludeId = null) => {
  let query = 'SELECT id FROM departments WHERE name = $1 AND is_deleted = FALSE';
  const params = [name];
  
  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }
  
  const { rows } = await pool.query(query, params);
  return rows.length > 0;
};

export const getDescendants = async (id) => {
  const query = `
    WITH RECURSIVE sub_depts AS (
      SELECT id FROM departments WHERE parent_id = $1 AND is_deleted = FALSE
      UNION ALL
      SELECT d.id FROM departments d
      INNER JOIN sub_depts sd ON d.parent_id = sd.id
      WHERE d.is_deleted = FALSE
    )
    SELECT id FROM sub_depts;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows.map(r => r.id);
};

export const hasDependentRecords = async (id) => {
  // Check active users
  const userRes = await pool.query('SELECT id FROM users WHERE department_id = $1 AND is_deleted = FALSE LIMIT 1', [id]);
  // Check assets
  const assetRes = await pool.query('SELECT id FROM assets WHERE current_department_id = $1 AND is_deleted = FALSE LIMIT 1', [id]);
  // Check bookings
  const bookingRes = await pool.query(
    `SELECT rb.id FROM resource_bookings rb
     JOIN assets a ON rb.resource_id = a.id
     WHERE a.current_department_id = $1 AND rb.is_deleted = FALSE LIMIT 1`,
    [id]
  );
  // Check maintenance
  const maintRes = await pool.query(
    `SELECT mr.id FROM maintenance_requests mr
     JOIN assets a ON mr.asset_id = a.id
     WHERE a.current_department_id = $1 AND mr.is_deleted = FALSE LIMIT 1`,
    [id]
  );
  // Check audits
  const auditRes = await pool.query(
    `SELECT ai.id FROM audit_items ai
     JOIN assets a ON ai.asset_id = a.id
     WHERE a.current_department_id = $1 LIMIT 1`,
    [id]
  );

  return {
    hasEmployees: userRes.rows.length > 0,
    hasAssets: assetRes.rows.length > 0,
    hasBookings: bookingRes.rows.length > 0,
    hasMaintenance: maintRes.rows.length > 0,
    hasAudits: auditRes.rows.length > 0
  };
};

export const isManagerAssignedElsewhere = async (managerId, excludeDeptId = null) => {
  let query = 'SELECT id FROM departments WHERE manager_id = $1 AND is_deleted = FALSE';
  const params = [managerId];

  if (excludeDeptId) {
    query += ' AND id != $2';
    params.push(excludeDeptId);
  }

  const { rows } = await pool.query(query, params);
  return rows.length > 0;
};

export const getUserById = async (userId) => {
  const { rows } = await pool.query('SELECT id, name, department_id, email FROM users WHERE id = $1 AND is_deleted = FALSE', [userId]);
  return rows[0];
};

export const updateUserDepartment = async (userId, departmentId) => {
  await pool.query('UPDATE users SET department_id = $2 WHERE id = $1', [userId, departmentId]);
};

export const createNotification = async (userId, type, title, message) => {
  await centralCreateNotification(userId, {
    title,
    message,
    category: 'SYSTEM',
    priority: 'MEDIUM'
  });
};

export const createActivityLog = async (userId, action, moduleName, entity, entityId, metadata) => {
  await pool.query(
    'INSERT INTO activity_logs (user_id, action, module, entity, entity_id, metadata) VALUES ($1, $2, $3, $4, $5, $6)',
    [userId, action, moduleName, entity, entityId, JSON.stringify(metadata)]
  );
};
