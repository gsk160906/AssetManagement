import pool from '../../db/index.js';

export const getAssets = async (filters = {}) => {
  const {
    q,
    status,
    department_id,
    category_id,
    condition,
    manufacturer,
    is_shared_bookable,
    minCost,
    maxCost,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    limit = 10,
    offset = 0
  } = filters;

  let query = `
    SELECT 
      a.*,
      c.name AS category_name,
      d.name AS department_name,
      u.name AS created_by_name
    FROM assets a
    LEFT JOIN asset_categories c ON a.category_id = c.id
    LEFT JOIN departments d ON a.current_department_id = d.id
    LEFT JOIN users u ON a.created_by_id = u.id
    WHERE a.is_deleted = false
  `;
  const params = [];
  let paramIndex = 1;

  if (q) {
    query += ` AND (
      a.name ILIKE $${paramIndex} OR 
      a.asset_tag ILIKE $${paramIndex} OR 
      a.serial_number ILIKE $${paramIndex} OR 
      a.manufacturer ILIKE $${paramIndex} OR 
      a.model ILIKE $${paramIndex}
    )`;
    params.push(`%${q}%`);
    paramIndex++;
  }

  if (status) {
    query += ` AND a.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (department_id) {
    query += ` AND a.current_department_id = $${paramIndex}`;
    params.push(department_id);
    paramIndex++;
  }

  if (category_id) {
    query += ` AND a.category_id = $${paramIndex}`;
    params.push(category_id);
    paramIndex++;
  }

  if (condition) {
    query += ` AND a.condition = $${paramIndex}`;
    params.push(condition);
    paramIndex++;
  }

  if (manufacturer) {
    query += ` AND a.manufacturer ILIKE $${paramIndex}`;
    params.push(manufacturer);
    paramIndex++;
  }

  if (is_shared_bookable !== undefined && is_shared_bookable !== null) {
    query += ` AND a.is_shared_bookable = $${paramIndex}`;
    params.push(is_shared_bookable === 'true' || is_shared_bookable === true);
    paramIndex++;
  }

  if (minCost !== undefined && minCost !== '') {
    query += ` AND a.acquisition_cost >= $${paramIndex}`;
    params.push(parseFloat(minCost));
    paramIndex++;
  }

  if (maxCost !== undefined && maxCost !== '') {
    query += ` AND a.acquisition_cost <= $${paramIndex}`;
    params.push(parseFloat(maxCost));
    paramIndex++;
  }

  // Validate sorting fields to prevent SQL injection
  const allowedSortFields = ['created_at', 'acquisition_date', 'acquisition_cost', 'name', 'asset_tag'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  query += ` ORDER BY a.${sortField} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const getAssetsCount = async (filters = {}) => {
  const {
    q,
    status,
    department_id,
    category_id,
    condition,
    manufacturer,
    is_shared_bookable,
    minCost,
    maxCost
  } = filters;

  let query = `
    SELECT COUNT(*) AS count
    FROM assets a
    WHERE a.is_deleted = false
  `;
  const params = [];
  let paramIndex = 1;

  if (q) {
    query += ` AND (
      a.name ILIKE $${paramIndex} OR 
      a.asset_tag ILIKE $${paramIndex} OR 
      a.serial_number ILIKE $${paramIndex} OR 
      a.manufacturer ILIKE $${paramIndex} OR 
      a.model ILIKE $${paramIndex}
    )`;
    params.push(`%${q}%`);
    paramIndex++;
  }

  if (status) {
    query += ` AND a.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (department_id) {
    query += ` AND a.current_department_id = $${paramIndex}`;
    params.push(department_id);
    paramIndex++;
  }

  if (category_id) {
    query += ` AND a.category_id = $${paramIndex}`;
    params.push(category_id);
    paramIndex++;
  }

  if (condition) {
    query += ` AND a.condition = $${paramIndex}`;
    params.push(condition);
    paramIndex++;
  }

  if (manufacturer) {
    query += ` AND a.manufacturer ILIKE $${paramIndex}`;
    params.push(manufacturer);
    paramIndex++;
  }

  if (is_shared_bookable !== undefined && is_shared_bookable !== null) {
    query += ` AND a.is_shared_bookable = $${paramIndex}`;
    params.push(is_shared_bookable === 'true' || is_shared_bookable === true);
    paramIndex++;
  }

  if (minCost !== undefined && minCost !== '') {
    query += ` AND a.acquisition_cost >= $${paramIndex}`;
    params.push(parseFloat(minCost));
    paramIndex++;
  }

  if (maxCost !== undefined && maxCost !== '') {
    query += ` AND a.acquisition_cost <= $${paramIndex}`;
    params.push(parseFloat(maxCost));
    paramIndex++;
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count, 10);
};

export const getAssetById = async (id) => {
  const query = `
    SELECT 
      a.*,
      c.name AS category_name,
      d.name AS department_name,
      u.name AS created_by_name
    FROM assets a
    LEFT JOIN asset_categories c ON a.category_id = c.id
    LEFT JOIN departments d ON a.current_department_id = d.id
    LEFT JOIN users u ON a.created_by_id = u.id
    WHERE a.id = $1 AND a.is_deleted = false
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const createAsset = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO assets (
      asset_tag, name, category_id, serial_number, manufacturer, model, 
      acquisition_date, acquisition_cost, warranty_expiry_date, condition, 
      status, current_department_id, current_location, is_shared_bookable, 
      image_url, created_by_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *
  `;
  const result = await db.query(query, [
    data.asset_tag,
    data.name,
    data.category_id,
    data.serial_number,
    data.manufacturer,
    data.model,
    data.acquisition_date,
    parseFloat(data.acquisition_cost),
    data.warranty_expiry_date || null,
    data.condition || 'EXCELLENT',
    data.status || 'AVAILABLE',
    data.current_department_id || null,
    data.current_location || null,
    data.is_shared_bookable || false,
    data.image_url || null,
    data.created_by_id || null
  ]);
  return result.rows[0];
};

export const updateAsset = async (client, id, data) => {
  const db = client || pool;
  const fields = [];
  const params = [id];
  let paramIndex = 2;

  const updatableFields = [
    'asset_tag', 'name', 'category_id', 'serial_number', 'manufacturer', 'model',
    'acquisition_date', 'acquisition_cost', 'warranty_expiry_date', 'condition',
    'status', 'current_department_id', 'current_location', 'is_shared_bookable',
    'image_url', 'updated_at'
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex}`);
      params.push(data[field]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return getAssetById(id);

  const query = `
    UPDATE assets 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = false
    RETURNING *
  `;
  const result = await db.query(query, params);
  return result.rows[0] || null;
};

export const deleteAsset = async (client, id) => {
  const db = client || pool;
  const query = `
    UPDATE assets 
    SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

export const duplicateAsset = async (client, id, newTag, newSerial) => {
  const db = client || pool;
  const asset = await getAssetById(id);
  if (!asset) throw new Error('Asset not found');

  const query = `
    INSERT INTO assets (
      asset_tag, name, category_id, serial_number, manufacturer, model,
      acquisition_date, acquisition_cost, warranty_expiry_date, condition,
      status, current_department_id, current_location, is_shared_bookable,
      image_url, created_by_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *
  `;
  const result = await db.query(query, [
    newTag,
    asset.name,
    asset.category_id,
    newSerial,
    asset.manufacturer,
    asset.model,
    asset.acquisition_date,
    asset.acquisition_cost,
    asset.warranty_expiry_date,
    asset.condition,
    'AVAILABLE',
    asset.current_department_id,
    asset.current_location,
    asset.is_shared_bookable,
    asset.image_url,
    asset.created_by_id
  ]);
  return result.rows[0];
};

export const archiveAsset = async (client, id, status) => {
  const db = client || pool;
  const query = `
    UPDATE assets
    SET status = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await db.query(query, [id, status]);
  return result.rows[0] || null;
};

// Allocations Repositories
export const allocateAsset = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO asset_allocations (
      asset_id, employee_id, allocated_date, expected_return_date, condition_before, notes, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
    RETURNING *
  `;
  const result = await db.query(query, [
    data.asset_id,
    data.employee_id,
    data.allocated_date || new Date(),
    data.expected_return_date || null,
    data.condition_before || 'GOOD',
    data.notes || null
  ]);
  return result.rows[0];
};

export const returnAsset = async (client, assetId, actualReturnDate, conditionAfter, notes) => {
  const db = client || pool;
  const query = `
    UPDATE asset_allocations
    SET 
      actual_return_date = $2,
      condition_after = $3,
      notes = COALESCE(notes || ' | Return notes: ' || $4, $4),
      status = 'RETURNED',
      updated_at = CURRENT_TIMESTAMP
    WHERE asset_id = $1 AND status = 'ACTIVE' AND is_deleted = false
    RETURNING *
  `;
  const result = await db.query(query, [assetId, actualReturnDate || new Date(), conditionAfter, notes]);
  return result.rows[0];
};

export const extendAllocation = async (client, allocationId, newExpectedReturnDate) => {
  const db = client || pool;
  const query = `
    UPDATE asset_allocations
    SET 
      expected_return_date = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND status = 'ACTIVE' AND is_deleted = false
    RETURNING *
  `;
  const result = await db.query(query, [allocationId, newExpectedReturnDate]);
  return result.rows[0];
};

export const allocationHistory = async (assetId) => {
  const query = `
    SELECT aa.*, u.name AS employee_name, u.email AS employee_email
    FROM asset_allocations aa
    INNER JOIN users u ON aa.employee_id = u.id
    WHERE aa.asset_id = $1 AND aa.is_deleted = false
    ORDER BY aa.allocated_date DESC
  `;
  const result = await pool.query(query, [assetId]);
  return result.rows;
};

export const currentAllocation = async (assetId) => {
  const query = `
    SELECT aa.*, u.name AS employee_name, u.email AS employee_email
    FROM asset_allocations aa
    INNER JOIN users u ON aa.employee_id = u.id
    WHERE aa.asset_id = $1 AND aa.status = 'ACTIVE' AND aa.is_deleted = false
    ORDER BY aa.created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [assetId]);
  return result.rows[0] || null;
};

// Transfer Repositories
export const requestTransfer = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO transfer_requests (
      asset_id, requested_by_id, from_employee_id, to_employee_id, remarks, status
    ) VALUES ($1, $2, $3, $4, $5, 'PENDING')
    RETURNING *
  `;
  const result = await db.query(query, [
    data.asset_id,
    data.requested_by_id,
    data.from_employee_id || null,
    data.to_employee_id,
    data.remarks || null
  ]);
  return result.rows[0];
};

export const getTransferById = async (id) => {
  const query = `
    SELECT tr.*, a.current_department_id, a.name AS asset_name, a.asset_tag
    FROM transfer_requests tr
    INNER JOIN assets a ON tr.asset_id = a.id
    WHERE tr.id = $1 AND tr.is_deleted = false
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const approveTransfer = async (client, transferId, approvedById) => {
  const db = client || pool;
  const query = `
    UPDATE transfer_requests
    SET status = 'APPROVED', approved_by_id = $2, action_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND status = 'PENDING' AND is_deleted = false
    RETURNING *
  `;
  const result = await db.query(query, [transferId, approvedById]);
  return result.rows[0];
};

export const rejectTransfer = async (client, transferId, approvedById, remarks) => {
  const db = client || pool;
  const query = `
    UPDATE transfer_requests
    SET status = 'REJECTED', approved_by_id = $2, remarks = $3, action_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND status = 'PENDING' AND is_deleted = false
    RETURNING *
  `;
  const result = await db.query(query, [transferId, approvedById, remarks]);
  return result.rows[0];
};

export const completeTransfer = async (client, transferId) => {
  const db = client || pool;
  const query = `
    UPDATE transfer_requests
    SET status = 'COMPLETED', action_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND status = 'APPROVED' AND is_deleted = false
    RETURNING *
  `;
  const result = await db.query(query, [transferId]);
  return result.rows[0];
};

export const transferHistory = async (assetId) => {
  const query = `
    SELECT 
      tr.*, 
      u1.name AS requested_by_name,
      u2.name AS from_employee_name,
      u3.name AS to_employee_name,
      u4.name AS approved_by_name
    FROM transfer_requests tr
    LEFT JOIN users u1 ON tr.requested_by_id = u1.id
    LEFT JOIN users u2 ON tr.from_employee_id = u2.id
    LEFT JOIN users u3 ON tr.to_employee_id = u3.id
    LEFT JOIN users u4 ON tr.approved_by_id = u4.id
    WHERE tr.asset_id = $1 AND tr.is_deleted = false
    ORDER BY tr.request_date DESC
  `;
  const result = await pool.query(query, [assetId]);
  return result.rows;
};

// Maintenance Repositories
export const createMaintenance = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO maintenance_requests (
      asset_id, raised_by_id, description, priority, status
    ) VALUES ($1, $2, $3, $4, 'PENDING')
    RETURNING *
  `;
  const result = await db.query(query, [
    data.asset_id,
    data.raised_by_id,
    data.description,
    data.priority || 'MEDIUM'
  ]);
  return result.rows[0];
};

export const assignTechnician = async (client, ticketId, technicianId) => {
  const db = client || pool;
  const query = `
    UPDATE maintenance_requests
    SET 
      assigned_technician_id = $2,
      status = 'TECHNICIAN_ASSIGNED',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = false
    RETURNING *
  `;
  const result = await db.query(query, [ticketId, technicianId]);
  return result.rows[0];
};

export const updateMaintenance = async (client, ticketId, data) => {
  const db = client || pool;
  const fields = [];
  const params = [ticketId];
  let paramIndex = 2;

  const updatableFields = ['description', 'priority', 'status', 'estimated_cost', 'actual_cost', 'completed_date', 'notes'];
  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex}`);
      params.push(data[field]);
      paramIndex++;
    }
  }

  const query = `
    UPDATE maintenance_requests
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = false
    RETURNING *
  `;
  const result = await db.query(query, params);
  return result.rows[0];
};

export const maintenanceHistory = async (assetId) => {
  const query = `
    SELECT 
      mr.*,
      u1.name AS raised_by_name,
      u2.name AS assigned_technician_name
    FROM maintenance_requests mr
    LEFT JOIN users u1 ON mr.raised_by_id = u1.id
    LEFT JOIN users u2 ON mr.assigned_technician_id = u2.id
    WHERE mr.asset_id = $1 AND mr.is_deleted = false
    ORDER BY mr.created_at DESC
  `;
  const result = await pool.query(query, [assetId]);
  return result.rows;
};

// Warranty Repositories
export const expiringWarranties = async (days = 30) => {
  const query = `
    SELECT a.*, c.name AS category_name, d.name AS department_name
    FROM assets a
    LEFT JOIN asset_categories c ON a.category_id = c.id
    LEFT JOIN departments d ON a.current_department_id = d.id
    WHERE 
      a.warranty_expiry_date >= CURRENT_DATE AND 
      a.warranty_expiry_date <= CURRENT_DATE + CAST($1 || ' days' AS INTERVAL) AND
      a.is_deleted = false
    ORDER BY a.warranty_expiry_date ASC
  `;
  const result = await pool.query(query, [days]);
  return result.rows;
};

export const expiredWarranties = async () => {
  const query = `
    SELECT a.*, c.name AS category_name, d.name AS department_name
    FROM assets a
    LEFT JOIN asset_categories c ON a.category_id = c.id
    LEFT JOIN departments d ON a.current_department_id = d.id
    WHERE a.warranty_expiry_date < CURRENT_DATE AND a.is_deleted = false
    ORDER BY a.warranty_expiry_date DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Documents Repositories
export const createDocument = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO asset_documents (
      asset_id, file_name, file_type, file_size, file_url, uploaded_by_id
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await db.query(query, [
    data.asset_id,
    data.file_name,
    data.file_type,
    parseInt(data.file_size, 10),
    data.file_url,
    data.uploaded_by_id
  ]);
  return result.rows[0];
};

export const getDocuments = async (assetId) => {
  const query = `
    SELECT ad.*, u.name AS uploaded_by_name
    FROM asset_documents ad
    LEFT JOIN users u ON ad.uploaded_by_id = u.id
    WHERE ad.asset_id = $1 AND ad.is_deleted = false
    ORDER BY ad.created_at DESC
  `;
  const result = await pool.query(query, [assetId]);
  return result.rows;
};

export const deleteDocument = async (client, id) => {
  const db = client || pool;
  const query = `
    UPDATE asset_documents
    SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

// Chronological timeline
export const getAssetTimeline = async (assetId) => {
  const query = `
    SELECT event_date, event_type, description, user_name
    FROM (
      SELECT created_at AS event_date, 'CREATED'::varchar AS event_type, 'Asset record created'::varchar AS description, NULL::varchar AS user_name FROM assets WHERE id = $1 AND is_deleted = false
      UNION ALL
      SELECT allocated_date AS event_date, 'ALLOCATED'::varchar AS event_type, 'Asset allocated'::varchar AS description, u.name AS user_name FROM asset_allocations aa JOIN users u ON aa.employee_id = u.id WHERE aa.asset_id = $1 AND aa.is_deleted = false
      UNION ALL
      SELECT actual_return_date AS event_date, 'RETURNED'::varchar AS event_type, 'Asset returned'::varchar AS description, u.name AS user_name FROM asset_allocations aa JOIN users u ON aa.employee_id = u.id WHERE aa.asset_id = $1 AND aa.actual_return_date IS NOT NULL AND aa.is_deleted = false
      UNION ALL
      SELECT request_date AS event_date, 'TRANSFER_REQUEST'::varchar AS event_type, 'Asset transfer requested'::varchar AS description, u.name AS user_name FROM transfer_requests tr JOIN users u ON tr.requested_by_id = u.id WHERE tr.asset_id = $1 AND tr.is_deleted = false
      UNION ALL
      SELECT action_date AS event_date, 'TRANSFERRED'::varchar AS event_type, 'Asset transfer completed'::varchar AS description, u.name AS user_name FROM transfer_requests tr JOIN users u ON tr.approved_by_id = u.id WHERE tr.asset_id = $1 AND tr.status = 'APPROVED' AND tr.action_date IS NOT NULL AND tr.is_deleted = false
      UNION ALL
      SELECT created_at AS event_date, 'MAINTENANCE_CREATED'::varchar AS event_type, 'Maintenance request: ' || description::varchar AS description, u.name AS user_name FROM maintenance_requests mr JOIN users u ON mr.raised_by_id = u.id WHERE mr.asset_id = $1 AND mr.is_deleted = false
      UNION ALL
      SELECT completed_date AS event_date, 'MAINTENANCE_RESOLVED'::varchar AS event_type, 'Maintenance resolved'::varchar AS description, u.name AS user_name FROM maintenance_requests mr JOIN users u ON mr.assigned_technician_id = u.id WHERE mr.asset_id = $1 AND mr.status = 'RESOLVED' AND mr.completed_date IS NOT NULL AND mr.is_deleted = false
    ) timeline
    ORDER BY event_date ASC
  `;
  const result = await pool.query(query, [assetId]);
  return result.rows;
};

// Activity logging helper
export const insertActivityLog = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO activity_logs (user_id, action, module, entity, entity_id, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  return db.query(query, [
    data.user_id,
    data.action,
    data.module,
    data.entity,
    data.entity_id,
    typeof data.metadata === 'object' ? JSON.stringify(data.metadata) : data.metadata
  ]);
};

// Notification helper
export const insertNotification = async (client, data) => {
  const db = client || pool;
  const query = `
    INSERT INTO notifications (user_id, type, title, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  return db.query(query, [
    data.user_id,
    data.type,
    data.title,
    data.message
  ]);
};
