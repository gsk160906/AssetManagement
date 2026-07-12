import pool from '../../db/index.js';

const TICKET_SELECT = `
  SELECT
    mr.id, mr.description, mr.priority,
    (CASE WHEN mr.status = 'REJECTED' THEN 'CANCELLED' ELSE mr.status::text END) AS status,
    mr.estimated_cost, mr.actual_cost, mr.completed_date,
    mr.created_at, mr.updated_at,
    a.id          AS asset_id,
    a.asset_tag   AS asset_tag,
    a.name        AS asset_name,
    a.serial_number,
    a.status      AS asset_status,
    c.name        AS category_name,
    rb.name       AS raised_by_name,
    rb.email      AS raised_by_email,
    te.name       AS technician_name,
    te.email      AS technician_email,
    d.name        AS department_name,
    mr.asset_id        AS raw_asset_id,
    mr.raised_by_id,
    mr.assigned_technician_id
  FROM maintenance_requests mr
  JOIN assets a        ON mr.asset_id = a.id
  LEFT JOIN asset_categories c  ON a.category_id = c.id
  JOIN users rb        ON mr.raised_by_id = rb.id
  LEFT JOIN users te   ON mr.assigned_technician_id = te.id
  LEFT JOIN departments d ON a.current_department_id = d.id
`;


export const createTicket = async (client, data) => {
  const db = client || pool;
  const { rows } = await db.query(
    `INSERT INTO maintenance_requests
       (asset_id, raised_by_id, description, priority, estimated_cost, status)
     VALUES ($1, $2, $3, $4, $5, 'PENDING')
     RETURNING *`,
    [data.assetId, data.raisedById, data.description, data.priority, data.estimatedCost ?? 0]
  );
  return rows[0];
};

export const getTickets = async (filters) => {
  const { q = '', priority = '', status = '', assetId = '', departmentId = '', page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;
  const values = [];

  let where = 'WHERE mr.is_deleted = FALSE';

  if (q) {
    values.push(`%${q}%`);
    where += ` AND (a.name ILIKE $${values.length} OR a.asset_tag ILIKE $${values.length} OR mr.description ILIKE $${values.length} OR te.name ILIKE $${values.length})`;
  }
  if (priority) { values.push(priority); where += ` AND mr.priority = $${values.length}`; }
  if (status)   {
    const mappedStatus = status === 'CANCELLED' ? 'REJECTED' : status;
    values.push(mappedStatus);
    where += ` AND mr.status = $${values.length}`;
  }
  if (assetId)  { values.push(assetId);  where += ` AND mr.asset_id = $${values.length}`; }
  if (departmentId) { values.push(departmentId); where += ` AND a.current_department_id = $${values.length}`; }

  values.push(limit, offset);
  const query = `${TICKET_SELECT} ${where} ORDER BY mr.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;
  const { rows } = await pool.query(query, values);
  return rows;
};

export const getTicketsCount = async (filters) => {
  const { q = '', priority = '', status = '', assetId = '', departmentId = '' } = filters;
  const values = [];
  let where = 'WHERE mr.is_deleted = FALSE';

  if (q) {
    values.push(`%${q}%`);
    where += ` AND (a.name ILIKE $${values.length} OR a.asset_tag ILIKE $${values.length} OR mr.description ILIKE $${values.length} OR te.name ILIKE $${values.length})`;
  }
  if (priority) { values.push(priority); where += ` AND mr.priority = $${values.length}`; }
  if (status)   {
    const mappedStatus = status === 'CANCELLED' ? 'REJECTED' : status;
    values.push(mappedStatus);
    where += ` AND mr.status = $${values.length}`;
  }
  if (assetId)  { values.push(assetId);  where += ` AND mr.asset_id = $${values.length}`; }
  if (departmentId) { values.push(departmentId); where += ` AND a.current_department_id = $${values.length}`; }

  const query = `SELECT COUNT(*) FROM maintenance_requests mr
    JOIN assets a ON mr.asset_id = a.id
    LEFT JOIN users te ON mr.assigned_technician_id = te.id ${where}`;
  const { rows } = await pool.query(query, values);
  return parseInt(rows[0].count, 10);
};

export const getTicketById = async (id) => {
  const { rows } = await pool.query(`${TICKET_SELECT} WHERE mr.id = $1 AND mr.is_deleted = FALSE`, [id]);
  return rows[0] || null;
};

export const updateTicket = async (client, id, data) => {
  const db = client || pool;
  const fields = [];
  const values = [];

  if (data.description !== undefined) { values.push(data.description); fields.push(`description = $${values.length}`); }
  if (data.priority !== undefined)    { values.push(data.priority);    fields.push(`priority = $${values.length}`); }
  if (data.estimatedCost !== undefined) { values.push(data.estimatedCost); fields.push(`estimated_cost = $${values.length}`); }
  if (data.assignedTechnicianId !== undefined) { values.push(data.assignedTechnicianId); fields.push(`assigned_technician_id = $${values.length}`); }
  if (data.status !== undefined) {
    const mappedStatus = data.status === 'CANCELLED' ? 'REJECTED' : data.status;
    values.push(mappedStatus);
    fields.push(`status = $${values.length}`);
  }
  if (data.actualCost !== undefined)  { values.push(data.actualCost);  fields.push(`actual_cost = $${values.length}`); }
  if (data.completedDate !== undefined) { values.push(data.completedDate); fields.push(`completed_date = $${values.length}`); }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  const { rows } = await db.query(
    `UPDATE maintenance_requests SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0];
};

export const softDeleteTicket = async (id) => {
  const { rows } = await pool.query(
    `UPDATE maintenance_requests SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'PENDING' RETURNING id`,
    [id]
  );
  return rows[0] || null;
};

export const updateAssetStatus = async (client, assetId, status) => {
  const db = client || pool;
  const { rows } = await db.query(
    `UPDATE assets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [status, assetId]
  );
  return rows[0];
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

export const getMaintenanceStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING')     AS pending,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
      COUNT(*) FILTER (WHERE status = 'RESOLVED')    AS resolved,
      COUNT(*) FILTER (WHERE status = 'REJECTED')    AS cancelled,
      COALESCE(SUM(actual_cost) FILTER (WHERE status = 'RESOLVED'), 0) AS total_actual_cost,
      COALESCE(AVG(actual_cost) FILTER (WHERE status = 'RESOLVED'), 0) AS avg_cost
    FROM maintenance_requests
    WHERE is_deleted = FALSE
  `);
  return rows[0];
};
