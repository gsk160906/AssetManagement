import pool from '../../db/index.js';
import * as repo from './allocation.repository.js';

export const getAllocations = async (filters) => {
  const [allocations, total] = await Promise.all([
    repo.getAllocations(filters),
    repo.getAllocationsCount(filters)
  ]);
  return {
    allocations,
    total,
    page: parseInt(filters.page || 1, 10),
    limit: parseInt(filters.limit || 10, 10)
  };
};

export const getAssetHistory = async (assetId) => {
  // Verify asset exists
  const assetRes = await pool.query('SELECT id FROM assets WHERE id = $1', [assetId]);
  if (assetRes.rows.length === 0) {
    throw new Error('Asset not found');
  }
  return repo.getAllocationHistory(assetId);
};

export const getEmployeeAssets = async (employeeId) => {
  // Verify employee exists
  const empRes = await pool.query('SELECT id FROM users WHERE id = $1', [employeeId]);
  if (empRes.rows.length === 0) {
    throw new Error('Employee not found');
  }
  return repo.getEmployeeAssets(employeeId);
};

export const allocateAsset = async (user, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify Asset availability
    const assetRes = await client.query('SELECT id, name, asset_tag, status, condition FROM assets WHERE id = $1', [data.assetId]);
    if (assetRes.rows.length === 0) {
      throw new Error('Asset not found.');
    }
    const asset = assetRes.rows[0];
    if (asset.status !== 'AVAILABLE') {
      throw new Error('Asset already allocated.');
    }

    // 2. Verify Employee exists
    const employeeRes = await client.query('SELECT id, name FROM users WHERE id = $1', [data.employeeId]);
    if (employeeRes.rows.length === 0) {
      throw new Error('Employee not found.');
    }
    const employee = employeeRes.rows[0];

    // 3. Prevent duplicate active allocations
    const activeAlloc = await repo.findActiveAllocation(data.assetId);
    if (activeAlloc) {
      throw new Error('Asset already allocated.');
    }

    // 4. Create Allocation
    const allocation = await repo.createAllocation(client, {
      assetId: data.assetId,
      employeeId: data.employeeId,
      expectedReturnDate: data.expectedReturnDate,
      notes: data.notes,
      conditionBefore: asset.condition
    });

    // 5. Update Asset Status
    await repo.updateAssetStatus(client, data.assetId, 'ALLOCATED');

    // 6. Create Notification
    await repo.createNotification(client, {
      userId: data.employeeId,
      type: 'ALLOCATION',
      title: 'Asset Assigned',
      message: `Laptop ${asset.name} (${asset.asset_tag}) has been assigned to you.`
    });

    // 7. Create Activity Log
    await repo.createActivityLog(client, {
      userId: user.id,
      action: 'ALLOCATED',
      module: 'ALLOCATIONS',
      entity: 'asset_allocations',
      entityId: allocation.id,
      metadata: {
        assetId: asset.id,
        assetTag: asset.asset_tag,
        employeeName: employee.name,
        notes: data.notes
      }
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

export const returnAsset = async (user, allocationId, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch current active allocation
    const allocQuery = await client.query('SELECT * FROM asset_allocations WHERE id = $1 AND status = \'ACTIVE\'', [allocationId]);
    if (allocQuery.rows.length === 0) {
      throw new Error('Active allocation not found.');
    }
    const allocation = allocQuery.rows[0];

    // 2. Fetch asset profile
    const assetQuery = await client.query('SELECT id, name, asset_tag FROM assets WHERE id = $1', [allocation.asset_id]);
    const asset = assetQuery.rows[0];

    // 3. Return Allocation
    const returned = await repo.returnAllocation(client, allocationId, {
      conditionAfter: data.conditionAfter,
      notes: data.notes
    });

    // 4. Update Asset to AVAILABLE (or UNDER_MAINTENANCE if poor/damaged condition returned)
    const finalAssetStatus = ['POOR', 'DAMAGED'].includes(data.conditionAfter) ? 'UNDER_MAINTENANCE' : 'AVAILABLE';
    await repo.updateAssetStatus(client, allocation.asset_id, finalAssetStatus);

    // 5. Notify Employee
    await repo.createNotification(client, {
      userId: allocation.employee_id,
      type: 'ALLOCATION',
      title: 'Asset Returned Successfully',
      message: `The allocation for Laptop ${asset.name} (${asset.asset_tag}) has been closed.`
    });

    // 6. Create Activity Log
    await repo.createActivityLog(client, {
      userId: user.id,
      action: 'RETURNED',
      module: 'ALLOCATIONS',
      entity: 'asset_allocations',
      entityId: returned.id,
      metadata: {
        assetId: asset.id,
        assetTag: asset.asset_tag,
        conditionAfter: data.conditionAfter
      }
    });

    await client.query('COMMIT');
    return returned;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const transferAsset = async (user, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify Asset and active allocation
    const assetQuery = await client.query('SELECT id, name, asset_tag, condition FROM assets WHERE id = $1', [data.assetId]);
    if (assetQuery.rows.length === 0) {
      throw new Error('Asset not found.');
    }
    const asset = assetQuery.rows[0];

    const activeAlloc = await repo.findActiveAllocation(data.assetId);
    if (!activeAlloc) {
      throw new Error('No active allocation exists for this asset.');
    }

    // 2. Verify destination Employee exists
    const employeeQuery = await client.query('SELECT id, name, department_id FROM users WHERE id = $1', [data.newEmployeeId]);
    if (employeeQuery.rows.length === 0) {
      throw new Error('Employee not found.');
    }
    const destinationEmployee = employeeQuery.rows[0];

    // 3. Close the previous allocation
    await repo.closeAllocation(client, activeAlloc.id, 'TRANSFERRED', `Transferred: ${data.notes || ''}`);

    // 4. Create new allocation for destination Employee
    const newAllocation = await repo.createAllocation(client, {
      assetId: data.assetId,
      employeeId: data.newEmployeeId,
      notes: data.notes,
      conditionBefore: asset.condition
    });

    // 5. Update Asset department and status
    await repo.updateAssetStatus(client, data.assetId, 'ALLOCATED', destinationEmployee.department_id);

    // 6. Notifications for both users
    await repo.createNotification(client, {
      userId: activeAlloc.employee_id,
      type: 'ALLOCATION',
      title: 'Asset Transferred',
      message: `Laptop ${asset.name} (${asset.asset_tag}) has been transferred to another employee.`
    });

    await repo.createNotification(client, {
      userId: data.newEmployeeId,
      type: 'ALLOCATION',
      title: 'Asset Assigned',
      message: `Laptop ${asset.name} (${asset.asset_tag}) has been transferred to you.`
    });

    // 7. Activity Log
    await repo.createActivityLog(client, {
      userId: user.id,
      action: 'TRANSFERRED',
      module: 'ALLOCATIONS',
      entity: 'asset_allocations',
      entityId: newAllocation.id,
      metadata: {
        assetId: asset.id,
        assetTag: asset.asset_tag,
        oldEmployeeName: activeAlloc.employee_name,
        newEmployeeName: destinationEmployee.name,
        notes: data.notes
      }
    });

    await client.query('COMMIT');
    return newAllocation;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
