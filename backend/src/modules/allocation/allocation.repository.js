import pool from '../../db/index.js';

export const createAllocation = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO asset_allocations (
      asset_id, employee_id, expected_return_date, notes, status, condition_before
    ) VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
    RETURNING *;
  `;
  const values = [
    data.assetId,
    data.employeeId,
    data.expectedReturnDate || null,
    data.notes || null,
    data.conditionBefore || 'GOOD'
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const closeAllocation = async (client, id, status, notes) => {
  const db = client || pool;
  const query = `
    UPDATE asset_allocations
    SET status = $1, actual_return_date = CURRENT_DATE, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND status = 'ACTIVE'
    RETURNING *;
  `;
  const { rows } = await db.query(query, [status, notes || null, id]);
  return rows[0];
};

export const returnAllocation = async (client, id, data) => {
  const db = client || pool;
  const query = `
    UPDATE asset_allocations
    SET status = 'RETURNED', actual_return_date = CURRENT_DATE, condition_after = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND status = 'ACTIVE'
    RETURNING *;
  `;
  const { rows } = await db.query(query, [data.conditionAfter, data.notes || null, id]);
  return rows[0];
};

export const findActiveAllocation = async (assetId) => {
  const query = `
    SELECT aa.*, u.name as employee_name, u.email as employee_email, d.name as department_name
    FROM asset_allocations aa
    JOIN users u ON aa.employee_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE aa.asset_id = $1 AND aa.status = 'ACTIVE'
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [assetId]);
  return rows[0] || null;
};

export const getAllocationHistory = async (assetId) => {
  const query = `
    SELECT aa.*, 
           u.name as employee_name, 
           d.name as department_name,
           (CASE WHEN aa.actual_return_date IS NOT NULL THEN (aa.actual_return_date - aa.allocated_date) ELSE NULL END) as duration_days
    FROM asset_allocations aa
    JOIN users u ON aa.employee_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE aa.asset_id = $1
    ORDER BY aa.allocated_date DESC, aa.created_at DESC;
  `;
  const { rows } = await pool.query(query, [assetId]);
  return rows;
};

export const getEmployeeAssets = async (employeeId) => {
  const query = `
    SELECT aa.*, 
           a.asset_tag, a.name as asset_name, a.serial_number, a.manufacturer, a.model, a.image_url, a.condition as current_condition,
           c.name as category_name,
           u.name as employee_name, u.email as employee_email,
           d.name as department_name
    FROM asset_allocations aa
    JOIN assets a ON aa.asset_id = a.id
    LEFT JOIN asset_categories c ON a.category_id = c.id
    JOIN users u ON aa.employee_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE aa.employee_id = $1 AND aa.status = 'ACTIVE'
    ORDER BY aa.allocated_date DESC;
  `;
  const { rows } = await pool.query(query, [employeeId]);
  return rows;
};


export const getAllocations = async (filters) => {
  const { q = '', status = '', departmentId = '', employeeId = '', categoryId = '', page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  let query = `
    SELECT aa.*, 
           a.asset_tag, a.name as asset_name, a.serial_number,
           c.name as category_name,
           u.name as employee_name, u.email as employee_email,
           d.name as department_name
    FROM asset_allocations aa
    JOIN assets a ON aa.asset_id = a.id
    LEFT JOIN asset_categories c ON a.category_id = c.id
    JOIN users u ON aa.employee_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE aa.is_deleted = FALSE
  `;
  const values = [];

  if (q) {
    values.push(`%${q}%`);
    query += ` AND (a.name ILIKE $${values.length} OR a.asset_tag ILIKE $${values.length} OR u.name ILIKE $${values.length})`;
  }
  if (status) {
    values.push(status);
    query += ` AND aa.status = $${values.length}`;
  }
  if (departmentId) {
    values.push(departmentId);
    query += ` AND u.department_id = $${values.length}`;
  }
  if (employeeId) {
    values.push(employeeId);
    query += ` AND aa.employee_id = $${values.length}`;
  }
  if (categoryId) {
    values.push(categoryId);
    query += ` AND a.category_id = $${values.length}`;
  }

  // Add Pagination
  values.push(limit, offset);
  query += ` ORDER BY aa.allocated_date DESC, aa.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const { rows } = await pool.query(query, values);
  return rows;
};

export const getAllocationsCount = async (filters) => {
  const { q = '', status = '', departmentId = '', employeeId = '', categoryId = '' } = filters;

  let query = `
    SELECT COUNT(*)
    FROM asset_allocations aa
    JOIN assets a ON aa.asset_id = a.id
    JOIN users u ON aa.employee_id = u.id
    WHERE aa.is_deleted = FALSE
  `;
  const values = [];

  if (q) {
    values.push(`%${q}%`);
    query += ` AND (a.name ILIKE $${values.length} OR a.asset_tag ILIKE $${values.length} OR u.name ILIKE $${values.length})`;
  }
  if (status) {
    values.push(status);
    query += ` AND aa.status = $${values.length}`;
  }
  if (departmentId) {
    values.push(departmentId);
    query += ` AND u.department_id = $${values.length}`;
  }
  if (employeeId) {
    values.push(employeeId);
    query += ` AND aa.employee_id = $${values.length}`;
  }
  if (categoryId) {
    values.push(categoryId);
    query += ` AND a.category_id = $${values.length}`;
  }

  const { rows } = await pool.query(query, values);
  return parseInt(rows[0].count, 10);
};

export const updateAssetStatus = async (client, assetId, status, departmentId) => {
  const db = client || pool;
  let query = `UPDATE assets SET status = $1`;
  const values = [status];

  if (departmentId !== undefined) {
    values.push(departmentId);
    query += `, current_department_id = $2`;
  }
  
  values.push(assetId);
  query += ` WHERE id = $${values.length} RETURNING *;`;
  
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const createNotification = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO notifications (user_id, type, title, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [data.userId, data.type, data.title, data.message];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const createActivityLog = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO activity_logs (user_id, action, module, entity, entity_id, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    data.userId,
    data.action,
    data.module,
    data.entity,
    data.entityId,
    data.metadata ? JSON.stringify(data.metadata) : null
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};
