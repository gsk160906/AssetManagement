import QRCode from 'qrcode';
import pool from '../../db/index.js';
import * as assetsRepository from './assets.repository.js';
import * as mapper from './assets.mapper.js';
import { ASSET_STATUS, ALLOCATION_STATUS } from './assets.constants.js';

export const getAssets = async (filters) => {
  const [assets, count] = await Promise.all([
    assetsRepository.getAssets(filters),
    assetsRepository.getAssetsCount(filters)
  ]);
  return {
    assets: mapper.mapAssets(assets),
    total: count,
    page: parseInt(filters.page || 1, 10),
    limit: parseInt(filters.limit || 10, 10)
  };
};

export const getAssetById = async (id) => {
  const asset = await assetsRepository.getAssetById(id);
  if (!asset) return null;
  return mapper.mapAsset(asset);
};

export const createAsset = async (user, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const assetData = { ...data, created_by_id: user.id };
    const newAsset = await assetsRepository.createAsset(client, assetData);

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'CREATE',
      module: 'ASSETS',
      entity: 'assets',
      entity_id: newAsset.id,
      metadata: { tag: newAsset.asset_tag, name: newAsset.name }
    });

    await client.query('COMMIT');
    return mapper.mapAsset(newAsset);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateAsset = async (user, id, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatedAsset = await assetsRepository.updateAsset(client, id, data);
    if (!updatedAsset) throw new Error('Asset not found');

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'UPDATE',
      module: 'ASSETS',
      entity: 'assets',
      entity_id: id,
      metadata: data
    });

    await client.query('COMMIT');
    return mapper.mapAsset(updatedAsset);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteAsset = async (user, id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deletedAsset = await assetsRepository.deleteAsset(client, id);
    if (!deletedAsset) throw new Error('Asset not found');

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'DELETE',
      module: 'ASSETS',
      entity: 'assets',
      entity_id: id,
      metadata: { tag: deletedAsset.asset_tag }
    });

    await client.query('COMMIT');
    return mapper.mapAsset(deletedAsset);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const duplicateAsset = async (user, id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newTag = `AST-DUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newSerial = `SN-DUP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    const dupAsset = await assetsRepository.duplicateAsset(client, id, newTag, newSerial);

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'CREATE',
      module: 'ASSETS',
      entity: 'assets',
      entity_id: dupAsset.id,
      metadata: { tag: dupAsset.asset_tag, duplicated_from: id }
    });

    await client.query('COMMIT');
    return mapper.mapAsset(dupAsset);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const archiveAsset = async (user, id, status) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const archived = await assetsRepository.archiveAsset(client, id, status);
    if (!archived) throw new Error('Asset not found');

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'STATUS_CHANGED',
      module: 'ASSETS',
      entity: 'assets',
      entity_id: id,
      metadata: { new_status: status }
    });

    await client.query('COMMIT');
    return mapper.mapAsset(archived);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Allocation Workflows
export const allocateAsset = async (user, assetId, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const asset = await assetsRepository.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');
    if (asset.status !== ASSET_STATUS.AVAILABLE) {
      throw new Error(`Asset is not available for allocation. Current status: ${asset.status}`);
    }

    // Create Allocation
    const allocation = await assetsRepository.allocateAsset(client, {
      asset_id: assetId,
      employee_id: data.employee_id,
      allocated_date: data.allocated_date,
      expected_return_date: data.expected_return_date,
      condition_before: data.condition_before,
      notes: data.notes
    });

    // Update Asset Status
    await assetsRepository.updateAsset(client, assetId, { status: ASSET_STATUS.ALLOCATED });

    // Create Notification
    await assetsRepository.insertNotification(client, {
      user_id: data.employee_id,
      type: 'ALLOCATION',
      title: 'Asset Allocated',
      message: `Asset ${asset.name} (${asset.asset_tag}) has been allocated to you.`
    });

    // Create Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'ALLOCATE',
      module: 'ALLOCATIONS',
      entity: 'asset_allocations',
      entity_id: allocation.id,
      metadata: { asset_id: assetId, employee_id: data.employee_id }
    });

    await client.query('COMMIT');
    return allocation;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const returnAsset = async (user, assetId, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const asset = await assetsRepository.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');
    if (asset.status !== ASSET_STATUS.ALLOCATED) {
      throw new Error('Asset is not currently allocated');
    }

    const currentAlloc = await assetsRepository.currentAllocation(assetId);
    if (!currentAlloc) throw new Error('No active allocation record found');

    // Return Allocation
    const allocation = await assetsRepository.returnAsset(
      client,
      assetId,
      data.actual_return_date,
      data.condition_after,
      data.notes
    );

    // Update Asset Status
    await assetsRepository.updateAsset(client, assetId, {
      status: ASSET_STATUS.AVAILABLE,
      condition: data.condition_after
    });

    // Notify User
    await assetsRepository.insertNotification(client, {
      user_id: currentAlloc.employee_id,
      type: 'ALLOCATION',
      title: 'Asset Returned',
      message: `The allocation for ${asset.name} (${asset.asset_tag}) has been marked as returned.`
    });

    // Create Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'RETURN',
      module: 'ALLOCATIONS',
      entity: 'asset_allocations',
      entity_id: allocation.id,
      metadata: { asset_id: assetId, employee_id: currentAlloc.employee_id }
    });

    await client.query('COMMIT');
    return allocation;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const extendAllocation = async (user, allocationId, newExpectedReturnDate) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const extended = await assetsRepository.extendAllocation(client, allocationId, newExpectedReturnDate);

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'UPDATE',
      module: 'ALLOCATIONS',
      entity: 'asset_allocations',
      entity_id: allocationId,
      metadata: { extended_to: newExpectedReturnDate }
    });

    await client.query('COMMIT');
    return extended;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getAllocationHistory = async (assetId) => {
  return assetsRepository.allocationHistory(assetId);
};

// Transfer Workflows
export const requestTransfer = async (user, assetId, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const asset = await assetsRepository.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');

    const activeAlloc = await assetsRepository.currentAllocation(assetId);
    const fromEmployeeId = activeAlloc ? activeAlloc.employee_id : null;

    const request = await assetsRepository.requestTransfer(client, {
      asset_id: assetId,
      requested_by_id: user.id,
      from_employee_id: fromEmployeeId,
      to_employee_id: data.to_employee_id,
      remarks: data.remarks
    });

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'TRANSFER',
      module: 'TRANSFERS',
      entity: 'transfer_requests',
      entity_id: request.id,
      metadata: { asset_id: assetId, to_employee_id: data.to_employee_id }
    });

    await client.query('COMMIT');
    return request;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const approveTransfer = async (user, transferId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const approved = await assetsRepository.approveTransfer(client, transferId, user.id);

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'UPDATE',
      module: 'TRANSFERS',
      entity: 'transfer_requests',
      entity_id: transferId,
      metadata: { action: 'APPROVE' }
    });

    await client.query('COMMIT');
    return approved;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const rejectTransfer = async (user, transferId, remarks) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const rejected = await assetsRepository.rejectTransfer(client, transferId, user.id, remarks);

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'UPDATE',
      module: 'TRANSFERS',
      entity: 'transfer_requests',
      entity_id: transferId,
      metadata: { action: 'REJECT', remarks }
    });

    await client.query('COMMIT');
    return rejected;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const completeTransfer = async (user, transferId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const transfer = await assetsRepository.getTransferById(transferId);
    if (!transfer) throw new Error('Transfer request not found');
    if (transfer.status !== 'APPROVED') {
      throw new Error(`Only approved transfers can be completed. Current status: ${transfer.status}`);
    }

    const asset = await assetsRepository.getAssetById(transfer.asset_id);
    if (!asset) throw new Error('Asset not found');

    // Deactivate previous active allocation if it exists
    await client.query(
      `UPDATE asset_allocations 
       SET status = 'TRANSFERRED', actual_return_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP 
       WHERE asset_id = $1 AND status = 'ACTIVE'`,
      [transfer.asset_id]
    );

    // Fetch the target employee to extract their department_id
    const empResult = await client.query('SELECT department_id FROM users WHERE id = $1', [transfer.to_employee_id]);
    const targetDeptId = empResult.rows[0]?.department_id || null;

    // Create a new allocation for the target employee
    await assetsRepository.allocateAsset(client, {
      asset_id: transfer.asset_id,
      employee_id: transfer.to_employee_id,
      allocated_date: new Date(),
      condition_before: asset.condition,
      notes: `Transferred via request ID ${transferId}`
    });

    // Update the Asset department and status
    await assetsRepository.updateAsset(client, transfer.asset_id, {
      status: ASSET_STATUS.ALLOCATED,
      current_department_id: targetDeptId
    });

    // Complete Transfer
    const completed = await assetsRepository.completeTransfer(client, transferId);

    // Notify target employee
    await assetsRepository.insertNotification(client, {
      user_id: transfer.to_employee_id,
      type: 'TRANSFER',
      title: 'Asset Transfer Completed',
      message: `Asset ${asset.name} (${asset.asset_tag}) has been transferred to you.`
    });

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'UPDATE',
      module: 'TRANSFERS',
      entity: 'transfer_requests',
      entity_id: transferId,
      metadata: { action: 'COMPLETE' }
    });

    await client.query('COMMIT');
    return completed;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getTransferHistory = async (assetId) => {
  return assetsRepository.transferHistory(assetId);
};

// Maintenance Workflows
export const createMaintenance = async (user, assetId, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ticket = await assetsRepository.createMaintenance(client, {
      asset_id: assetId,
      raised_by_id: user.id,
      description: data.description,
      priority: data.priority
    });

    // Update Asset Status to UNDER_MAINTENANCE
    await assetsRepository.updateAsset(client, assetId, { status: ASSET_STATUS.UNDER_MAINTENANCE });

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'MAINTENANCE_CREATED',
      module: 'MAINTENANCE',
      entity: 'maintenance_requests',
      entity_id: ticket.id,
      metadata: { priority: data.priority }
    });

    await client.query('COMMIT');
    return ticket;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const assignTechnician = async (user, ticketId, technicianId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const assigned = await assetsRepository.assignTechnician(client, ticketId, technicianId);

    // Notify technician
    await assetsRepository.insertNotification(client, {
      user_id: technicianId,
      type: 'MAINTENANCE',
      title: 'Technician Assigned',
      message: `You have been assigned to repair ticket ID ${ticketId}`
    });

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'UPDATE',
      module: 'MAINTENANCE',
      entity: 'maintenance_requests',
      entity_id: ticketId,
      metadata: { technician_id: technicianId }
    });

    await client.query('COMMIT');
    return assigned;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateMaintenance = async (user, ticketId, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await assetsRepository.updateMaintenance(client, ticketId, data);

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'UPDATE',
      module: 'MAINTENANCE',
      entity: 'maintenance_requests',
      entity_id: ticketId,
      metadata: data
    });

    await client.query('COMMIT');
    return updated;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const resolveMaintenance = async (user, ticketId, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Fetch request to identify asset ID
    const ticketQuery = await client.query('SELECT asset_id, raised_by_id FROM maintenance_requests WHERE id = $1', [ticketId]);
    const ticket = ticketQuery.rows[0];
    if (!ticket) throw new Error('Maintenance request not found');

    // Update maintenance request
    const resolved = await assetsRepository.updateMaintenance(client, ticketId, {
      status: 'RESOLVED',
      actual_cost: data.actual_cost,
      completed_date: new Date(),
      notes: data.notes
    });

    // Update Asset Status to AVAILABLE
    await assetsRepository.updateAsset(client, ticket.asset_id, { status: ASSET_STATUS.AVAILABLE });

    // Notify requester
    await assetsRepository.insertNotification(client, {
      user_id: ticket.raised_by_id,
      type: 'MAINTENANCE',
      title: 'Repair Ticket Resolved',
      message: `Your maintenance ticket for asset ID ${ticket.asset_id} has been marked as resolved.`
    });

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'MAINTENANCE_RESOLVED',
      module: 'MAINTENANCE',
      entity: 'maintenance_requests',
      entity_id: ticketId,
      metadata: { actual_cost: data.actual_cost }
    });

    await client.query('COMMIT');
    return resolved;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getMaintenanceHistory = async (assetId) => {
  return assetsRepository.maintenanceHistory(assetId);
};

// Warranty Workflows
export const getExpiringWarranties = async (days) => {
  const rows = await assetsRepository.expiringWarranties(days);
  return mapper.mapAssets(rows);
};

export const getExpiredWarranties = async () => {
  const rows = await assetsRepository.expiredWarranties();
  return mapper.mapAssets(rows);
};

// Documents Workflows
export const createDocument = async (user, assetId, docData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const doc = await assetsRepository.createDocument(client, {
      asset_id: assetId,
      file_name: docData.file_name,
      file_type: docData.file_type,
      file_size: docData.file_size,
      file_url: docData.file_url,
      uploaded_by_id: user.id
    });

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'DOCUMENT_UPLOADED',
      module: 'DOCUMENTS',
      entity: 'asset_documents',
      entity_id: doc.id,
      metadata: { file_name: doc.file_name }
    });

    await client.query('COMMIT');
    return doc;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getDocuments = async (assetId) => {
  return assetsRepository.getDocuments(assetId);
};

export const deleteDocument = async (user, id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deleted = await assetsRepository.deleteDocument(client, id);
    if (!deleted) throw new Error('Document not found');

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'DELETE',
      module: 'DOCUMENTS',
      entity: 'asset_documents',
      entity_id: id,
      metadata: { file_name: deleted.file_name }
    });

    await client.query('COMMIT');
    return deleted;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Chronological timeline
export const getAssetTimeline = async (id) => {
  return assetsRepository.getAssetTimeline(id);
};

// QR Code Generation
export const generateQRCode = async (id) => {
  const asset = await assetsRepository.getAssetById(id);
  if (!asset) throw new Error('Asset not found');

  const payload = {
    id: asset.id,
    tag: asset.asset_tag,
    serial: asset.serial_number,
    dept: asset.department_name || 'Unassigned',
    status: asset.status
  };

  // Convert payload object to base64 or JSON string QR code
  const qrDataUri = await QRCode.toDataURL(JSON.stringify(payload));
  return qrDataUri;
};

// Bulk Operations
export const bulkImport = async (user, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = [];

    for (const item of items) {
      const assetData = { ...item, created_by_id: user.id };
      const newAsset = await assetsRepository.createAsset(client, assetData);
      inserted.push(newAsset);
    }

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'CREATE',
      module: 'ASSETS',
      entity: 'assets',
      entity_id: null,
      metadata: { count: items.length }
    });

    await client.query('COMMIT');
    return mapper.mapAssets(inserted);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const bulkUpdateStatus = async (user, ids, status) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = [];

    for (const id of ids) {
      const result = await assetsRepository.updateAsset(client, id, { status });
      if (result) updated.push(result);
    }

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'STATUS_CHANGED',
      module: 'ASSETS',
      entity: 'assets',
      entity_id: null,
      metadata: { count: ids.length, new_status: status }
    });

    await client.query('COMMIT');
    return mapper.mapAssets(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const bulkDelete = async (user, ids) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deleted = [];

    for (const id of ids) {
      const result = await assetsRepository.deleteAsset(client, id);
      if (result) deleted.push(result);
    }

    // Activity Log
    await assetsRepository.insertActivityLog(client, {
      user_id: user.id,
      action: 'DELETE',
      module: 'ASSETS',
      entity: 'assets',
      entity_id: null,
      metadata: { count: ids.length }
    });

    await client.query('COMMIT');
    return mapper.mapAssets(deleted);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
