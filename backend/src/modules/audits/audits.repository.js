import pool from '../../db/index.js';

export const generateAuditCode = async (client) => {
  const db = client || pool;
  const currentYear = new Date().getFullYear();
  const { rows } = await db.query(
    `SELECT COUNT(*) FROM audits WHERE EXTRACT(YEAR FROM created_at) = $1`,
    [currentYear]
  );
  const count = parseInt(rows[0].count, 10) + 1;
  return `AUD-${currentYear}-${String(count).padStart(3, '0')}`;
};

export const createAudit = async (client, data) => {
  const db = client || pool;
  const code = await generateAuditCode(db);
  const { rows } = await db.query(
    `INSERT INTO audits (audit_code, audit_name, description, auditor_id, status, audit_type, start_date)
     VALUES ($1, $2, $3, $4, 'planned', $5, $6)
     RETURNING *`,
    [code, data.audit_name, data.description || null, data.auditor_id, data.audit_type, data.start_date]
  );
  return rows[0];
};

export const getAudits = async (filters) => {
  const { status = '', page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;
  const values = [];

  let query = `
    SELECT 
      a.id, a.audit_code, a.audit_name, a.description, a.status, a.audit_type, a.start_date, a.end_date, a.created_at,
      u.name AS auditor_name,
      COUNT(ai.id) AS total_assets,
      COUNT(ai.id) FILTER (WHERE ai.verification_status = 'verified') AS verified_assets,
      COUNT(ai.id) FILTER (WHERE ai.verification_status = 'missing') AS missing_assets,
      COUNT(ai.id) FILTER (WHERE ai.verification_status = 'pending') AS pending_assets
    FROM audits a
    JOIN users u ON a.auditor_id = u.id
    LEFT JOIN audit_items ai ON a.id = ai.audit_id
  `;

  if (status) {
    values.push(status);
    query += ` WHERE a.status = $${values.length}`;
  }

  query += `
    GROUP BY a.id, u.name
    ORDER BY a.created_at DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows;
};

export const getAuditsCount = async (filters) => {
  const { status = '' } = filters;
  const values = [];
  let query = `SELECT COUNT(*) FROM audits`;

  if (status) {
    values.push(status);
    query += ` WHERE status = $1`;
  }

  const { rows } = await pool.query(query, values);
  return parseInt(rows[0].count, 10);
};

export const getAuditById = async (id) => {
  const query = `
    SELECT a.*, u.name AS auditor_name, u.email AS auditor_email
    FROM audits a
    JOIN users u ON a.auditor_id = u.id
    WHERE a.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

export const startAudit = async (client, id) => {
  const db = client || pool;
  
  // 1. Update status
  await db.query(
    `UPDATE audits SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  );

  // 2. Snapshot all active assets as pending verification items
  // expected_location is snapshotted from assets.current_location
  await db.query(`
    INSERT INTO audit_items (audit_id, asset_id, expected_location, verification_status)
    SELECT $1, id, COALESCE(current_location, 'Unassigned'), 'pending'
    FROM assets
    WHERE is_deleted = FALSE AND status != 'RETIRED' AND status != 'DISPOSED'
    ON CONFLICT (audit_id, asset_id) DO NOTHING
  `, [id]);
};

export const verifyAsset = async (client, auditId, assetId, data, userId) => {
  const db = client || pool;
  const { rows } = await db.query(
    `UPDATE audit_items
     SET verification_status = $1, actual_location = $2, remarks = $3, verified_by = $4, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE audit_id = $5 AND asset_id = $6
     RETURNING *`,
    [data.verification_status, data.actual_location || null, data.remarks || null, userId, auditId, assetId]
  );
  return rows[0];
};

export const createAuditLog = async (client, auditId, userId, action, description) => {
  const db = client || pool;
  const { rows } = await db.query(
    `INSERT INTO audit_logs (audit_id, user_id, action, description)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [auditId, userId, action, description]
  );
  return rows[0];
};

export const completeAudit = async (client, id) => {
  const db = client || pool;
  const { rows } = await db.query(
    `UPDATE audits 
     SET status = 'completed', end_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
};

export const cancelAudit = async (client, id) => {
  const db = client || pool;
  const { rows } = await db.query(
    `UPDATE audits 
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
};

export const getAuditProgress = async (id) => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE verification_status = 'verified') AS verified,
      COUNT(*) FILTER (WHERE verification_status = 'missing') AS missing,
      COUNT(*) FILTER (WHERE verification_status = 'damaged') AS damaged,
      COUNT(*) FILTER (WHERE verification_status = 'relocated') AS relocated,
      COUNT(*) FILTER (WHERE verification_status = 'not_found') AS not_found,
      COUNT(*) FILTER (WHERE verification_status = 'pending') AS pending
    FROM audit_items
    WHERE audit_id = $1
  `, [id]);
  
  const stats = rows[0];
  const total = parseInt(stats.total, 10) || 0;
  const verified = parseInt(stats.verified, 10) || 0;
  const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;

  return {
    total,
    verified,
    missing: parseInt(stats.missing, 10) || 0,
    damaged: parseInt(stats.damaged, 10) || 0,
    relocated: parseInt(stats.relocated, 10) || 0,
    not_found: parseInt(stats.not_found, 10) || 0,
    pending: parseInt(stats.pending, 10) || 0,
    percentage
  };
};

export const getAuditReport = async (id) => {
  const progress = await getAuditProgress(id);
  const accuracy = progress.total > 0 ? Math.round((progress.verified / progress.total) * 100) : 0;
  return {
    total_assets: progress.total,
    verified: progress.verified,
    missing: progress.missing,
    damaged: progress.damaged,
    relocated: progress.relocated,
    not_found: progress.not_found,
    accuracy: `${accuracy}%`
  };
};

export const getAuditItemsList = async (auditId, filters) => {
  const { status = '', q = '' } = filters;
  const values = [auditId];
  
  let query = `
    SELECT 
      ai.*,
      a.name AS asset_name,
      a.asset_tag,
      c.name AS category_name,
      v.name AS verified_by_name
    FROM audit_items ai
    JOIN assets a ON ai.asset_id = a.id
    LEFT JOIN asset_categories c ON a.category_id = c.id
    LEFT JOIN users v ON ai.verified_by = v.id
    WHERE ai.audit_id = $1
  `;

  if (status) {
    values.push(status);
    query += ` AND ai.verification_status = $${values.length}`;
  }
  if (q) {
    values.push(`%${q}%`);
    query += ` AND (a.name ILIKE $${values.length} OR a.asset_tag ILIKE $${values.length})`;
  }

  query += ` ORDER BY a.name ASC`;
  const { rows } = await pool.query(query, values);
  return rows;
};

export const getAuditLogs = async (auditId) => {
  const { rows } = await pool.query(`
    SELECT al.*, u.name AS user_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.audit_id = $1
    ORDER BY al.created_at DESC
  `, [auditId]);
  return rows;
};
