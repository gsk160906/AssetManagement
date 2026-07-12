import pool from '../../db/index.js';

const BOOKING_SELECT = `
  SELECT 
    rb.id, 
    rb.start_time, 
    rb.end_time, 
    rb.purpose, 
    rb.notes, 
    rb.status, 
    rb.created_at, 
    rb.updated_at,
    (EXTRACT(EPOCH FROM (rb.end_time - rb.start_time)) / 3600)::numeric(10,2) AS duration_hours,
    a.id AS asset_id,
    a.asset_tag,
    a.name AS asset_name,
    a.manufacturer AS asset_manufacturer,
    a.model AS asset_model,
    a.current_location AS asset_location,
    c.name AS category_name,
    u.id AS employee_id,
    u.name AS employee_name,
    u.email AS employee_email,
    d.name AS department_name
  FROM resource_bookings rb
  JOIN assets a ON rb.resource_id = a.id
  LEFT JOIN asset_categories c ON a.category_id = c.id
  JOIN users u ON rb.employee_id = u.id
  LEFT JOIN departments d ON u.department_id = d.id
`;

export const syncBookingStatuses = async (client) => {
  const db = client || pool;
  // 1. Move upcoming to ongoing if time has started
  await db.query(`
    UPDATE resource_bookings
    SET status = 'ONGOING', updated_at = CURRENT_TIMESTAMP
    WHERE start_time <= CURRENT_TIMESTAMP 
      AND end_time > CURRENT_TIMESTAMP 
      AND status = 'UPCOMING' 
      AND is_deleted = FALSE
  `);

  // 2. Move active bookings to completed if time has ended
  await db.query(`
    UPDATE resource_bookings
    SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
    WHERE end_time <= CURRENT_TIMESTAMP 
      AND status IN ('UPCOMING', 'ONGOING') 
      AND is_deleted = FALSE
  `);
};

export const createBooking = async (client, data) => {
  const db = client || pool;
  const { rows } = await db.query(
    `INSERT INTO resource_bookings (resource_id, employee_id, start_time, end_time, purpose, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'UPCOMING')
     RETURNING *`,
    [data.resourceId, data.employeeId, data.startTime, data.endTime, data.purpose, data.notes || null]
  );
  return rows[0];
};

export const getBookingById = async (id) => {
  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE rb.id = $1 AND rb.is_deleted = FALSE`, [id]);
  return rows[0] || null;
};

export const getBookings = async (filters) => {
  const { q = '', status = '', employeeId = '', resourceId = '', departmentId = '', date = '', page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;
  const values = [];

  let where = 'WHERE rb.is_deleted = FALSE';

  if (q) {
    values.push(`%${q}%`);
    where += ` AND (a.name ILIKE $${values.length} OR a.asset_tag ILIKE $${values.length} OR rb.purpose ILIKE $${values.length} OR u.name ILIKE $${values.length})`;
  }
  if (status) {
    values.push(status);
    where += ` AND rb.status = $${values.length}`;
  }
  if (employeeId) {
    values.push(employeeId);
    where += ` AND rb.employee_id = $${values.length}`;
  }
  if (resourceId) {
    values.push(resourceId);
    where += ` AND rb.resource_id = $${values.length}`;
  }
  if (departmentId) {
    values.push(departmentId);
    where += ` AND u.department_id = $${values.length}`;
  }
  if (date) {
    values.push(date);
    where += ` AND (rb.start_time::date = $${values.length} OR rb.end_time::date = $${values.length})`;
  }

  values.push(limit, offset);
  const query = `${BOOKING_SELECT} ${where} ORDER BY rb.start_time DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;
  const { rows } = await pool.query(query, values);
  return rows;
};

export const getBookingsCount = async (filters) => {
  const { q = '', status = '', employeeId = '', resourceId = '', departmentId = '', date = '' } = filters;
  const values = [];
  let where = 'WHERE rb.is_deleted = FALSE';

  if (q) {
    values.push(`%${q}%`);
    where += ` AND (a.name ILIKE $${values.length} OR a.asset_tag ILIKE $${values.length} OR rb.purpose ILIKE $${values.length} OR u.name ILIKE $${values.length})`;
  }
  if (status) {
    values.push(status);
    where += ` AND rb.status = $${values.length}`;
  }
  if (employeeId) {
    values.push(employeeId);
    where += ` AND rb.employee_id = $${values.length}`;
  }
  if (resourceId) {
    values.push(resourceId);
    where += ` AND rb.resource_id = $${values.length}`;
  }
  if (departmentId) {
    values.push(departmentId);
    where += ` AND u.department_id = $${values.length}`;
  }
  if (date) {
    values.push(date);
    where += ` AND (rb.start_time::date = $${values.length} OR rb.end_time::date = $${values.length})`;
  }

  const query = `
    SELECT COUNT(*) 
    FROM resource_bookings rb
    JOIN assets a ON rb.resource_id = a.id
    JOIN users u ON rb.employee_id = u.id
    ${where}
  `;
  const { rows } = await pool.query(query, values);
  return parseInt(rows[0].count, 10);
};

export const updateBooking = async (client, id, data) => {
  const db = client || pool;
  const fields = [];
  const values = [];

  if (data.startTime !== undefined) { values.push(data.startTime); fields.push(`start_time = $${values.length}`); }
  if (data.endTime !== undefined)   { values.push(data.endTime);   fields.push(`end_time = $${values.length}`); }
  if (data.purpose !== undefined)   { values.push(data.purpose);   fields.push(`purpose = $${values.length}`); }
  if (data.notes !== undefined)     { values.push(data.notes);     fields.push(`notes = $${values.length}`); }
  if (data.status !== undefined)    { values.push(data.status);    fields.push(`status = $${values.length}`); }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const { rows } = await db.query(
    `UPDATE resource_bookings SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0];
};

export const softDeleteBooking = async (client, id) => {
  const db = client || pool;
  const { rows } = await db.query(
    `UPDATE resource_bookings 
     SET status = 'CANCELLED', is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
};

export const checkOverlappingBookings = async (client, resourceId, startTime, endTime, excludeBookingId = null) => {
  const db = client || pool;
  let query = `
    SELECT id FROM resource_bookings
    WHERE resource_id = $1
      AND status != 'CANCELLED'
      AND is_deleted = FALSE
      AND NOT (end_time <= $2 OR start_time >= $3)
  `;
  const values = [resourceId, startTime, endTime];

  if (excludeBookingId) {
    values.push(excludeBookingId);
    query += ` AND id != $4`;
  }

  const { rows } = await db.query(query, values);
  return rows;
};

export const getAvailableResources = async (startTime, endTime) => {
  // Return assets where is_shared_bookable = TRUE, status = 'AVAILABLE', and no active overlapping booking exists
  const query = `
    SELECT a.id, a.asset_tag, a.name, a.manufacturer, a.model, a.current_location, c.name AS category_name
    FROM assets a
    LEFT JOIN asset_categories c ON a.category_id = c.id
    WHERE a.is_shared_bookable = TRUE 
      AND a.status = 'AVAILABLE'
      AND a.is_deleted = FALSE
      AND NOT EXISTS (
        SELECT 1 FROM resource_bookings rb
        WHERE rb.resource_id = a.id
          AND rb.status != 'CANCELLED'
          AND rb.is_deleted = FALSE
          AND NOT (rb.end_time <= $1 OR rb.start_time >= $2)
      )
    ORDER BY a.name ASC
  `;
  const { rows } = await pool.query(query, [startTime, endTime]);
  return rows;
};

export const getBookingStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS total_bookings,
      COUNT(*) FILTER (WHERE status = 'UPCOMING') AS upcoming_bookings,
      COUNT(*) FILTER (WHERE status = 'ONGOING') AS ongoing_bookings,
      COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_bookings,
      COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled_bookings,
      COUNT(*) FILTER (WHERE start_time::date = CURRENT_DATE) AS today_bookings
    FROM resource_bookings
    WHERE is_deleted = FALSE
  `);
  
  // Calculate most booked asset
  const mostBooked = await pool.query(`
    SELECT a.name, COUNT(*) AS count
    FROM resource_bookings rb
    JOIN assets a ON rb.resource_id = a.id
    WHERE rb.is_deleted = FALSE
    GROUP BY a.name
    ORDER BY count DESC
    LIMIT 1
  `);

  return {
    ...rows[0],
    most_booked_resource: mostBooked.rows[0]?.name || '—'
  };
};

export const getCalendarEvents = async (filters) => {
  const { employeeId } = filters;
  let query = `
    SELECT 
      rb.id, 
      a.name AS title, 
      rb.start_time AS start, 
      rb.end_time AS "end", 
      rb.status,
      u.name AS employee_name
    FROM resource_bookings rb
    JOIN assets a ON rb.resource_id = a.id
    JOIN users u ON rb.employee_id = u.id
    WHERE rb.is_deleted = FALSE
  `;
  const values = [];
  if (employeeId) {
    values.push(employeeId);
    query += ` AND rb.employee_id = $1`;
  }
  query += ` ORDER BY rb.start_time ASC`;
  const { rows } = await pool.query(query, values);
  return rows;
};

export const createNotification = async (client, data) => {
  const db = client || pool;
  const { rows } = await db.query(
    `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.userId, data.type, data.title, data.message]
  );
  return rows[0];
};

export const createActivityLog = async (client, data) => {
  const db = client || pool;
  const { rows } = await db.query(
    `INSERT INTO activity_logs (user_id, action, module, entity, entity_id, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.userId, data.action, data.module, data.entity, data.entityId, data.metadata ? JSON.stringify(data.metadata) : null]
  );
  return rows[0];
};
