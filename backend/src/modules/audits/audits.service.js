import pool from '../../db/index.js';
import * as repo from './audits.repository.js';

export const getAudits = async (filters) => {
  const [audits, total] = await Promise.all([
    repo.getAudits(filters),
    repo.getAuditsCount(filters)
  ]);
  return { audits, total, page: parseInt(filters.page || 1, 10), limit: parseInt(filters.limit || 10, 10) };
};

export const getAuditById = async (id) => {
  const audit = await repo.getAuditById(id);
  if (!audit) throw Object.assign(new Error('Audit session not found'), { statusCode: 404 });
  return audit;
};

export const createAudit = async (user, data) => {
  // Validate auditor user exists
  const auditorRes = await pool.query('SELECT id, name FROM users WHERE id = $1 AND is_deleted = FALSE', [data.auditor_id]);
  if (auditorRes.rows.length === 0) {
    throw Object.assign(new Error('Auditor user not found'), { statusCode: 404 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const audit = await repo.createAudit(client, data);

    // Create log history
    await repo.createAuditLog(client, audit.id, user.id, 'CREATE_AUDIT', `Audit session ${audit.audit_code} created.`);

    // Create Notification to auditor
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'AUDIT', 'New Audit Assigned', $2)`,
      [data.auditor_id, `New audit assigned: ${data.audit_name} (${audit.audit_code}).`]
    );

    await client.query('COMMIT');
    return audit;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const startAudit = async (user, id) => {
  const audit = await repo.getAuditById(id);
  if (!audit) throw Object.assign(new Error('Audit not found'), { statusCode: 404 });
  if (audit.status !== 'planned') {
    throw Object.assign(new Error('Only planned audits can be started'), { statusCode: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await repo.startAudit(client, id);
    await repo.createAuditLog(client, id, user.id, 'START_AUDIT', `Audit session ${audit.audit_code} started, assets initialized.`);

    // Create notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'AUDIT', 'Audit Started', $2)`,
      [audit.auditor_id, `Audit ${audit.audit_code} has started.`]
    );

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const verifyAsset = async (user, auditId, assetId, data) => {
  const audit = await repo.getAuditById(auditId);
  if (!audit) throw Object.assign(new Error('Audit session not found'), { statusCode: 404 });
  if (audit.status !== 'in_progress') {
    throw Object.assign(new Error('Assets can only be verified during active in_progress audits'), { statusCode: 400 });
  }

  // Fetch asset details to log
  const assetRes = await pool.query('SELECT name, asset_tag FROM assets WHERE id = $1', [assetId]);
  const asset = assetRes.rows[0];
  if (!asset) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await repo.verifyAsset(client, auditId, assetId, data, user.id);

    // Create log history
    const logDesc = `Asset ${asset.name} (${asset.asset_tag}) marked as ${data.verification_status.toUpperCase()}. Remarks: ${data.remarks || 'None'}`;
    await repo.createAuditLog(client, auditId, user.id, 'VERIFY_ASSET', logDesc);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const bulkVerifyAssets = async (user, id, data) => {
  const audit = await repo.getAuditById(id);
  if (!audit) throw Object.assign(new Error('Audit session not found'), { statusCode: 404 });
  if (audit.status !== 'in_progress') {
    throw Object.assign(new Error('Assets can only be verified during active in_progress audits'), { statusCode: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const results = [];
    for (const item of data.assets) {
      const res = await repo.verifyAsset(client, id, item.id, {
        verification_status: item.status,
        actual_location: item.actual_location,
        remarks: item.remarks
      }, user.id);
      results.push(res);

      const assetRes = await client.query('SELECT name, asset_tag FROM assets WHERE id = $1', [item.id]);
      const asset = assetRes.rows[0];
      const logDesc = `Bulk Verify: Asset ${asset?.name ?? 'Unknown'} marked as ${item.status.toUpperCase()}.`;
      await repo.createAuditLog(client, id, user.id, 'VERIFY_ASSET', logDesc);
    }

    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const completeAudit = async (user, id) => {
  const audit = await repo.getAuditById(id);
  if (!audit) throw Object.assign(new Error('Audit session not found'), { statusCode: 404 });
  if (audit.status !== 'in_progress') {
    throw Object.assign(new Error('Only active audits in progress can be completed'), { statusCode: 400 });
  }

  // Check pending assets count
  const progress = await repo.getAuditProgress(id);
  if (progress.pending > 0) {
    throw Object.assign(new Error(`Cannot complete audit. ${progress.pending} pending assets remain to be verified.`), { statusCode: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const completed = await repo.completeAudit(client, id);
    const accuracy = `${progress.percentage}%`;

    await repo.createAuditLog(client, id, user.id, 'COMPLETE_AUDIT', `Audit session completed with accuracy of ${accuracy}.`);

    // Create Notification to auditor
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'AUDIT', 'Audit Completed', $2)`,
      [audit.auditor_id, `Audit completed. Accuracy: ${accuracy}.`]
    );

    await client.query('COMMIT');
    return completed;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const cancelAudit = async (user, id) => {
  const audit = await repo.getAuditById(id);
  if (!audit) throw Object.assign(new Error('Audit session not found'), { statusCode: 404 });
  if (!['planned', 'in_progress'].includes(audit.status)) {
    throw Object.assign(new Error('Completed audits cannot be cancelled'), { statusCode: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cancelled = await repo.cancelAudit(client, id);
    await repo.createAuditLog(client, id, user.id, 'CANCEL_AUDIT', `Audit session ${audit.audit_code} cancelled.`);

    await client.query('COMMIT');
    return cancelled;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getAuditProgress = async (id) => repo.getAuditProgress(id);
export const getAuditReport = async (id) => repo.getAuditReport(id);
export const getAuditItemsList = async (id, filters) => repo.getAuditItemsList(id, filters);
export const getAuditLogs = async (id) => repo.getAuditLogs(id);
