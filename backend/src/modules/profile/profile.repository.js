import pool from '../../db/index.js';

export const getProfile = async (userId) => {
  const query = `
    SELECT 
      u.id, u.employee_code, u.name, u.email, u.role, u.status,
      u.first_name, u.last_name, u.phone_number, u.designation, 
      u.profile_image_url, u.bio, u.timezone, u.language, 
      u.date_format, u.theme, u.last_profile_update, u.created_at, u.updated_at,
      d.name as department_name, d.id as department_id
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.id = $1 AND u.is_deleted = false
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

export const updateProfile = async (userId, data) => {
  const fields = [];
  const values = [];

  const allowedUpdates = [
    'first_name', 'last_name', 'phone_number', 'designation', 
    'bio', 'timezone', 'language', 'date_format', 'theme'
  ];

  Object.entries(data).forEach(([key, val]) => {
    if (allowedUpdates.includes(key)) {
      fields.push(`${key} = $${fields.length + 1}`);
      values.push(val);
    }
  });

  if (fields.length === 0) return getProfile(userId);

  values.push(userId);
  
  // Update name if first_name or last_name changed
  const nameQuery = `
    UPDATE users 
    SET ${fields.join(', ')}, 
        name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))),
        last_profile_update = NOW(),
        updated_at = NOW() 
    WHERE id = $${values.length} 
    RETURNING *`;

  const { rows } = await pool.query(nameQuery, values);
  return getProfile(userId);
};

export const updateProfileImage = async (userId, url) => {
  const query = `
    UPDATE users 
    SET profile_image_url = $1, last_profile_update = NOW(), updated_at = NOW() 
    WHERE id = $2 
    RETURNING id, profile_image_url
  `;
  const { rows } = await pool.query(query, [url, userId]);
  return rows[0];
};

export const removeProfileImage = async (userId) => {
  const query = `
    UPDATE users 
    SET profile_image_url = NULL, last_profile_update = NOW(), updated_at = NOW() 
    WHERE id = $1 
    RETURNING id, profile_image_url
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

export const changePassword = async (userId, passwordHash) => {
  const query = `
    UPDATE users 
    SET password_hash = $1, updated_at = NOW() 
    WHERE id = $2 
    RETURNING id
  `;
  const { rows } = await pool.query(query, [passwordHash, userId]);
  return rows[0];
};

export const getPreferences = async (userId) => {
  const query = 'SELECT * FROM user_preferences WHERE user_id = $1';
  const { rows } = await pool.query(query, [userId]);
  if (rows.length === 0) {
    return createPreferences(userId);
  }
  return rows[0];
};

export const createPreferences = async (userId) => {
  const query = `
    INSERT INTO user_preferences (user_id) 
    VALUES ($1) 
    ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
    RETURNING *
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

export const updatePreferences = async (userId, data) => {
  const fields = [];
  const values = [];

  Object.entries(data).forEach(([key, val]) => {
    fields.push(`${key} = $${fields.length + 1}`);
    values.push(val);
  });

  if (fields.length === 0) return getPreferences(userId);

  values.push(userId);
  const query = `
    UPDATE user_preferences 
    SET ${fields.join(', ')}, updated_at = NOW() 
    WHERE user_id = $${values.length} 
    RETURNING *
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const createSession = async (session) => {
  const query = `
    INSERT INTO user_sessions (
      id, user_id, refresh_token, device_name, browser, 
      operating_system, ip_address, location, expires_at
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    session.id,
    session.userId,
    session.refreshToken,
    session.deviceName || null,
    session.browser || null,
    session.operatingSystem || null,
    session.ipAddress || null,
    session.location || 'Unknown',
    session.expiresAt
  ]);
  return rows[0];
};

export const getSessions = async (userId) => {
  const query = `
    SELECT id, device_name, browser, operating_system, ip_address, location, last_activity, created_at, expires_at
    FROM user_sessions 
    WHERE user_id = $1 AND expires_at > NOW()
    ORDER BY last_activity DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const deleteSession = async (sessionId, userId) => {
  const query = 'DELETE FROM user_sessions WHERE id = $1 AND user_id = $2 RETURNING *';
  const { rows } = await pool.query(query, [sessionId, userId]);
  return rows[0];
};

export const deleteAllSessions = async (userId, excludeSessionId = null) => {
  let query = 'DELETE FROM user_sessions WHERE user_id = $1';
  const params = [userId];

  if (excludeSessionId) {
    query += ' AND id != $2';
    params.push(excludeSessionId);
  }

  const { rows } = await pool.query(query + ' RETURNING *', params);
  return rows;
};

export const updateLastActivity = async (sessionId) => {
  const query = 'UPDATE user_sessions SET last_activity = NOW() WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [sessionId]);
  return rows[0];
};

export const getPasswordHash = async (userId) => {
  const query = 'SELECT password_hash FROM users WHERE id = $1';
  const { rows } = await pool.query(query, [userId]);
  return rows[0]?.password_hash;
};

export const insertActivityLog = async (userId, action, entityId, metadata) => {
  await pool.query(
    `INSERT INTO activity_logs (user_id, action, module, entity, entity_id, metadata)
     VALUES ($1, $2, 'PROFILE', 'USER', $3, $4)`,
    [userId, action, entityId || userId, metadata ? JSON.stringify(metadata) : null]
  );
};
