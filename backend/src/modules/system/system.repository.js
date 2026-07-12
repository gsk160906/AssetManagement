import pool from '../../db/index.js';

export const hasAdmin = async (client = pool) => {
  const result = await client.query(
    "SELECT EXISTS(SELECT 1 FROM users WHERE role = 'ADMIN' AND is_deleted = false) as exists"
  );
  return result.rows[0].exists;
};

export const initializeAdmin = async ({
  userId,
  employeeCode,
  name,
  email,
  passwordHash,
  sessionId,
  refreshToken,
  clientInfo = {},
  expiresAt
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Double check again inside transaction to prevent concurrent registration
    const adminExists = await hasAdmin(client);
    if (adminExists) {
      throw new Error('System already initialized');
    }

    // Split name into first and last name
    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'Admin';

    // 2. Insert admin user
    await client.query(
      `INSERT INTO users (id, employee_code, name, email, password_hash, role, status, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, 'ADMIN', 'ACTIVE', $6, $7)`,
      [userId, employeeCode, name, email, passwordHash, firstName, lastName]
    );

    // 3. Create default user preferences
    await client.query(
      `INSERT INTO user_preferences (user_id) VALUES ($1)`,
      [userId]
    );

    // 4. Create active session
    await client.query(
      `INSERT INTO user_sessions (id, user_id, refresh_token, device_name, browser, operating_system, ip_address, location, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        sessionId,
        userId,
        refreshToken,
        clientInfo.deviceName || 'Desktop',
        clientInfo.browser || 'Unknown Browser',
        clientInfo.operatingSystem || 'Unknown OS',
        clientInfo.ipAddress || '127.0.0.1',
        'Unknown',
        expiresAt
      ]
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
