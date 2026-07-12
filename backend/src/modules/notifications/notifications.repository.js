import pool from '../../db/index.js';

export const getNotifications = async (userId, filters = {}) => {
  const { page = 1, limit = 20, category, priority, status } = filters;
  const offset = (page - 1) * limit;
  const values = [userId];
  
  let query = `
    SELECT * 
    FROM notifications 
    WHERE user_id = $1 
      AND is_deleted = FALSE 
      AND (expires_at IS NULL OR expires_at > NOW())
  `;

  if (category) {
    values.push(category);
    query += ` AND category = $${values.length}`;
  }

  if (priority) {
    values.push(priority);
    query += ` AND priority = $${values.length}`;
  }

  if (status) {
    const isRead = status === 'READ';
    values.push(isRead);
    query += ` AND is_read = $${values.length}`;
  }

  // Count before limits
  const countRes = await pool.query(query, values);
  const total = countRes.rows.length;

  // Pagination & Order
  values.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const { rows } = await pool.query(query, values);

  return {
    notifications: rows,
    total,
    page,
    limit
  };
};

export const getNotificationById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM notifications WHERE id = $1 AND is_deleted = FALSE',
    [id]
  );
  return rows[0];
};

export const getUnreadCount = async (userId) => {
  const { rows } = await pool.query(
    `SELECT 
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE is_read = FALSE) AS unread
     FROM notifications 
     WHERE user_id = $1 AND is_deleted = FALSE AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId]
  );
  return {
    total: parseInt(rows[0].total || 0, 10),
    unread: parseInt(rows[0].unread || 0, 10)
  };
};

export const markRead = async (id, userId) => {
  const { rows } = await pool.query(
    `UPDATE notifications 
     SET is_read = TRUE, read_at = NOW(), updated_at = NOW() 
     WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE 
     RETURNING *`,
    [id, userId]
  );
  return rows[0];
};

export const markUnread = async (id, userId) => {
  const { rows } = await pool.query(
    `UPDATE notifications 
     SET is_read = FALSE, read_at = NULL, updated_at = NOW() 
     WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE 
     RETURNING *`,
    [id, userId]
  );
  return rows[0];
};

export const markAllRead = async (userId) => {
  const { rows } = await pool.query(
    `UPDATE notifications 
     SET is_read = TRUE, read_at = NOW(), updated_at = NOW() 
     WHERE user_id = $1 AND is_read = FALSE AND is_deleted = FALSE 
     RETURNING *`,
    [userId]
  );
  return rows;
};

export const softDelete = async (id, userId) => {
  const { rows } = await pool.query(
    `UPDATE notifications 
     SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() 
     WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE 
     RETURNING *`,
    [id, userId]
  );
  return rows[0];
};

export const softDeleteRead = async (userId) => {
  const { rows } = await pool.query(
    `UPDATE notifications 
     SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() 
     WHERE user_id = $1 AND is_read = TRUE AND is_deleted = FALSE 
     RETURNING *`,
    [userId]
  );
  return rows;
};

export const saveNotification = async (data) => {
  const { userId, title, message, category, priority, actionUrl, actionLabel, expiresAt } = data;
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, title, message, category, priority, action_url, action_label, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      userId,
      title,
      message,
      category || 'SYSTEM',
      priority || 'MEDIUM',
      actionUrl || null,
      actionLabel || null,
      expiresAt || null
    ]
  );
  return rows[0];
};

export const createPreference = async (userId) => {
  const { rows } = await pool.query(
    `INSERT INTO notification_preferences (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [userId]
  );
  return rows[0];
};

export const getPreference = async (userId) => {
  let { rows } = await pool.query(
    'SELECT * FROM notification_preferences WHERE user_id = $1',
    [userId]
  );
  
  if (rows.length === 0) {
    // Dynamically initialize preference row if missing
    rows = [await createPreference(userId)];
  }
  
  return rows[0];
};

export const updatePreference = async (userId, data) => {
  const fields = [];
  const values = [];

  Object.entries(data).forEach(([key, val]) => {
    fields.push(`${key} = $${fields.length + 1}`);
    values.push(val);
  });

  if (fields.length === 0) return getPreference(userId);

  values.push(userId);
  const query = `
    UPDATE notification_preferences 
    SET ${fields.join(', ')}, updated_at = NOW() 
    WHERE user_id = $${values.length} 
    RETURNING *`;
    
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const insertActivityLog = async (userId, action, entityId, metadata) => {
  await pool.query(
    `INSERT INTO activity_logs (user_id, action, module, entity, entity_id, metadata)
     VALUES ($1, $2, 'NOTIFICATIONS', 'NOTIFICATION', $3, $4)`,
    [userId, action, entityId || userId, metadata ? JSON.stringify(metadata) : null]
  );
};
