import pool from '../../db/index.js';

export const findUsers = async (filters = {}, pagination = {}) => {
  const { search, role, status, departmentId } = filters;
  const { limit = 10, offset = 0 } = pagination;

  const values = [];
  let query = `
    SELECT u.id, u.employee_code, u.name, u.email, u.role, u.status, u.department_id, d.name as department_name, u.created_at
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.is_deleted = false
  `;

  if (search) {
    values.push(`%${search}%`);
    query += ` AND (u.name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR u.employee_code ILIKE $${values.length})`;
  }

  if (role) {
    values.push(role);
    query += ` AND u.role = $${values.length}`;
  }

  if (status) {
    values.push(status);
    query += ` AND u.status = $${values.length}`;
  }

  if (departmentId) {
    values.push(departmentId);
    query += ` AND u.department_id = $${values.length}`;
  }

  // Get total count before pagination
  const countQuery = `SELECT COUNT(*) FROM (${query}) as count_temp`;
  const countRes = await pool.query(countQuery, values);
  const total = parseInt(countRes.rows[0].count, 10);

  // Add sorting and pagination
  query += ` ORDER BY u.created_at DESC`;
  
  values.push(limit);
  query += ` LIMIT $${values.length}`;
  
  values.push(offset);
  query += ` OFFSET $${values.length}`;

  const { rows } = await pool.query(query, values);

  return { users: rows, total };
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT id FROM users WHERE email = $1 AND is_deleted = false',
    [email]
  );
  return result.rows[0];
};

export const getUserByEmployeeCode = async (code) => {
  const result = await pool.query(
    'SELECT id FROM users WHERE employee_code = $1 AND is_deleted = false',
    [code]
  );
  return result.rows[0];
};

export const createUser = async ({
  id,
  employeeCode,
  name,
  email,
  passwordHash,
  role,
  departmentId,
  status = 'ACTIVE'
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Split name into first and last name
    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'User';

    // Insert user
    await client.query(
      `INSERT INTO users (id, employee_code, name, email, password_hash, role, status, department_id, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, employeeCode, name, email, passwordHash, role, status, departmentId, firstName, lastName]
    );

    // Create user preferences
    await client.query(
      `INSERT INTO user_preferences (user_id) VALUES ($1)`,
      [id]
    );

    await client.query('COMMIT');
    
    // Return inserted user info (excluding password hash)
    const res = await client.query(
      `SELECT u.id, u.employee_code, u.name, u.email, u.role, u.status, u.department_id, d.name as department_name, u.created_at
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [id]
    );
    return res.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateUser = async (
  id,
  { name, email, role, departmentId, status }
) => {
  const parts = name.trim().split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || 'User';

  await pool.query(
    `UPDATE users 
     SET name = $1, email = $2, role = $3, department_id = $4, status = $5, first_name = $6, last_name = $7, updated_at = NOW()
     WHERE id = $8`,
    [name, email, role, departmentId, status, firstName, lastName, id]
  );

  // Return updated user
  const res = await pool.query(
    `SELECT u.id, u.employee_code, u.name, u.email, u.role, u.status, u.department_id, d.name as department_name, u.created_at
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.id = $1`,
    [id]
  );
  return res.rows[0];
};

export const softDeleteUser = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Mark as deleted
    await client.query(
      'UPDATE users SET is_deleted = true, updated_at = NOW() WHERE id = $1',
      [id]
    );

    // 2. Invalidate all sessions
    await client.query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [id]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
