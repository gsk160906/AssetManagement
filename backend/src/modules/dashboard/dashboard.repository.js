import pool from '../../db/index.js';

export const getOverviewStats = async (userId, role, departmentId) => {
  let query = '';
  const params = [userId];

  if (role === 'ADMIN' || role === 'ASSET_MANAGER') {
    query = `
      SELECT 
        (SELECT COUNT(*) FROM assets WHERE is_deleted = false) AS total_assets,
        (SELECT COUNT(*) FROM assets WHERE status = 'AVAILABLE' AND is_deleted = false) AS available_assets,
        (SELECT COUNT(*) FROM assets WHERE status = 'ALLOCATED' AND is_deleted = false) AS allocated_assets,
        (SELECT COUNT(*) FROM assets WHERE status = 'RESERVED' AND is_deleted = false) AS reserved_assets,
        (SELECT COUNT(*) FROM assets WHERE status = 'UNDER_MAINTENANCE' AND is_deleted = false) AS under_maintenance_assets,
        (SELECT COUNT(*) FROM assets WHERE status = 'RETIRED' AND is_deleted = false) AS retired_assets,
        (SELECT COUNT(*) FROM assets WHERE status = 'DISPOSED' AND is_deleted = false) AS disposed_assets,
        (SELECT COUNT(*) FROM users WHERE is_deleted = false) AS total_employees,
        (SELECT COUNT(*) FROM departments WHERE is_deleted = false) AS total_departments,
        (SELECT COUNT(*) FROM transfer_requests WHERE status = 'PENDING' AND is_deleted = false) AS pending_transfers,
        (SELECT COUNT(*) FROM maintenance_requests WHERE status = 'PENDING' AND is_deleted = false) AS pending_maintenance,
        (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND is_deleted = false) AS unread_notifications;
    `;
  } else if (role === 'DEPARTMENT_HEAD') {
    params.push(departmentId);
    query = `
      SELECT 
        (SELECT COUNT(*) FROM assets WHERE current_department_id = $2 AND is_deleted = false) AS total_assets,
        (SELECT COUNT(*) FROM assets WHERE current_department_id = $2 AND status = 'AVAILABLE' AND is_deleted = false) AS available_assets,
        (SELECT COUNT(*) FROM assets WHERE current_department_id = $2 AND status = 'ALLOCATED' AND is_deleted = false) AS allocated_assets,
        (SELECT COUNT(*) FROM assets WHERE current_department_id = $2 AND status = 'RESERVED' AND is_deleted = false) AS reserved_assets,
        (SELECT COUNT(*) FROM assets WHERE current_department_id = $2 AND status = 'UNDER_MAINTENANCE' AND is_deleted = false) AS under_maintenance_assets,
        (SELECT COUNT(*) FROM assets WHERE current_department_id = $2 AND status = 'RETIRED' AND is_deleted = false) AS retired_assets,
        (SELECT COUNT(*) FROM assets WHERE current_department_id = $2 AND status = 'DISPOSED' AND is_deleted = false) AS disposed_assets,
        (SELECT COUNT(*) FROM users WHERE department_id = $2 AND is_deleted = false) AS total_employees,
        (SELECT COUNT(*) FROM departments WHERE is_deleted = false) AS total_departments,
        (SELECT COUNT(*) FROM transfer_requests tr JOIN assets a ON tr.asset_id = a.id WHERE a.current_department_id = $2 AND tr.status = 'PENDING' AND tr.is_deleted = false) AS pending_transfers,
        (SELECT COUNT(*) FROM maintenance_requests mr JOIN assets a ON mr.asset_id = a.id WHERE a.current_department_id = $2 AND mr.status = 'PENDING' AND mr.is_deleted = false) AS pending_maintenance,
        (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND is_deleted = false) AS unread_notifications;
    `;
  } else {
    // EMPLOYEE role
    query = `
      SELECT 
        (SELECT COUNT(*) FROM asset_allocations WHERE employee_id = $1 AND status = 'ACTIVE' AND is_deleted = false) AS total_assets,
        0 AS available_assets,
        (SELECT COUNT(*) FROM asset_allocations WHERE employee_id = $1 AND status = 'ACTIVE' AND is_deleted = false) AS allocated_assets,
        0 AS reserved_assets,
        0 AS under_maintenance_assets,
        0 AS retired_assets,
        0 AS disposed_assets,
        1 AS total_employees,
        0 AS total_departments,
        0 AS pending_transfers,
        (SELECT COUNT(*) FROM maintenance_requests WHERE raised_by_id = $1 AND status = 'PENDING' AND is_deleted = false) AS pending_maintenance,
        (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND is_deleted = false) AS unread_notifications;
    `;
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};

export const getRecentActivities = async (userId, role, departmentId, limit, offset, rangeInterval) => {
  let query = `
    SELECT l.id, l.action, l.module, l.entity, l.entity_id, l.metadata, l.created_at, u.name AS user_name
    FROM activity_logs l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.is_deleted = false
  `;
  const params = [];
  let paramIndex = 1;

  if (rangeInterval) {
    query += ` AND l.created_at >= NOW() - CAST($${paramIndex} AS INTERVAL)`;
    params.push(rangeInterval);
    paramIndex++;
  }

  if (role === 'DEPARTMENT_HEAD') {
    query += ` AND u.department_id = $${paramIndex}`;
    params.push(departmentId);
    paramIndex++;
  } else if (role === 'EMPLOYEE') {
    query += ` AND l.user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const getUpcomingBookings = async (userId, role, departmentId, limit, offset) => {
  let query = `
    SELECT b.id, b.start_time, b.end_time, b.purpose, b.status, a.name AS asset_name, u.name AS employee_name
    FROM resource_bookings b
    INNER JOIN assets a ON b.resource_id = a.id
    INNER JOIN users u ON b.employee_id = u.id
    WHERE b.status = 'UPCOMING' AND b.is_deleted = false
  `;
  const params = [];
  let paramIndex = 1;

  if (role === 'DEPARTMENT_HEAD') {
    query += ` AND u.department_id = $${paramIndex}`;
    params.push(departmentId);
    paramIndex++;
  } else if (role === 'EMPLOYEE') {
    query += ` AND b.employee_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  query += ` ORDER BY b.start_time ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const getNotifications = async (userId, limit, offset) => {
  const query = `
    SELECT id, title, message, type, is_read, created_at
    FROM notifications
    WHERE user_id = $1 AND is_read = false AND is_deleted = false
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

export const getNotificationsCount = async (userId) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM notifications
    WHERE user_id = $1 AND is_read = false AND is_deleted = false
  `;
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].count, 10);
};
