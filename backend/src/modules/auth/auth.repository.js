import pool from '../../db/index.js';

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT id, employee_code, name, email, password_hash, department_id, role, status FROM users WHERE email = $1 AND is_deleted = false',
    [email]
  );
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, employee_code, name, email, department_id, role, status FROM users WHERE id = $1 AND is_deleted = false',
    [id]
  );
  return result.rows[0];
};
