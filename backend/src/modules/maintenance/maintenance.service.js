import pool from '../../db/index.js';
import * as repo from './maintenance.repository.js';

export const getMaintenances = async (filters) => {
  const [tickets, total] = await Promise.all([
    repo.getTickets(filters),
    repo.getTicketsCount(filters)
  ]);
  return { tickets, total, page: parseInt(filters.page || 1, 10), limit: parseInt(filters.limit || 10, 10) };
};

export const getMaintenanceById = async (id) => {
  const ticket = await repo.getTicketById(id);
  if (!ticket) throw Object.assign(new Error('Maintenance ticket not found'), { statusCode: 404 });
  return ticket;
};

export const getMaintenanceStats = async () => repo.getMaintenanceStats();

export const createMaintenance = async (user, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify asset exists and is not retired
    const assetRes = await client.query(
      `SELECT id, name, asset_tag, status FROM assets WHERE id = $1 AND is_deleted = FALSE`,
      [data.assetId]
    );
    if (!assetRes.rows[0]) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    const asset = assetRes.rows[0];
    if (asset.status === 'RETIRED') throw Object.assign(new Error('Cannot create maintenance request for a retired asset'), { statusCode: 409 });

    const ticket = await repo.createTicket(client, {
      assetId: data.assetId,
      raisedById: user.id,
      description: data.description,
      priority: data.priority,
      estimatedCost: data.estimatedCost
    });

    // Notify admins/asset managers
    const managersRes = await client.query(
      `SELECT id FROM users WHERE role IN ('ADMIN', 'ASSET_MANAGER') AND status = 'ACTIVE' AND is_deleted = FALSE`
    );
    for (const mgr of managersRes.rows) {
      if (mgr.id !== user.id) {
        await repo.createNotification(client, {
          userId: mgr.id,
          type: 'MAINTENANCE',
          title: 'New Maintenance Request',
          message: `A ${data.priority} priority maintenance request has been raised for ${asset.name} (${asset.asset_tag}).`
        });
      }
    }

    await repo.createActivityLog(client, {
      userId: user.id,
      action: 'MAINTENANCE_CREATED',
      module: 'MAINTENANCE',
      entity: 'maintenance_requests',
      entityId: ticket.id,
      metadata: { assetTag: asset.asset_tag, priority: data.priority }
    });

    await client.query('COMMIT');
    return ticket;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateMaintenance = async (user, id, data) => {
  const ticket = await repo.getTicketById(id);
  if (!ticket) throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  if (['RESOLVED', 'CANCELLED'].includes(ticket.status)) {
    throw Object.assign(new Error('Cannot edit a resolved or cancelled ticket'), { statusCode: 409 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updated = await repo.updateTicket(client, id, {
      description: data.description,
      priority: data.priority,
      estimatedCost: data.estimatedCost,
      assignedTechnicianId: data.assignedTechnicianId
    });

    // If a technician was newly assigned, notify them
    if (data.assignedTechnicianId && data.assignedTechnicianId !== ticket.assigned_technician_id) {
      const assetRes = await client.query('SELECT name, asset_tag FROM assets WHERE id = $1', [ticket.raw_asset_id || ticket.asset_id]);
      const asset = assetRes.rows[0];
      await repo.createNotification(client, {
        userId: data.assignedTechnicianId,
        type: 'MAINTENANCE',
        title: 'Maintenance Ticket Assigned',
        message: `You have been assigned to a maintenance request for ${asset?.name} (${asset?.asset_tag}).`
      });
      await repo.createActivityLog(client, {
        userId: user.id,
        action: 'TECHNICIAN_ASSIGNED',
        module: 'MAINTENANCE',
        entity: 'maintenance_requests',
        entityId: id,
        metadata: { technicianId: data.assignedTechnicianId }
      });
    }

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateStatus = async (user, id, data) => {
  const ticket = await repo.getTicketById(id);
  if (!ticket) throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  if (ticket.status === data.status) throw Object.assign(new Error(`Ticket is already ${data.status}`), { statusCode: 409 });
  if (['RESOLVED', 'CANCELLED'].includes(ticket.status)) {
    throw Object.assign(new Error('Ticket is already closed'), { statusCode: 409 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateData = { status: data.status };
    let newAssetStatus = null;

    if (data.status === 'IN_PROGRESS') {
      newAssetStatus = 'UNDER_MAINTENANCE';
    } else if (data.status === 'RESOLVED') {
      newAssetStatus = 'AVAILABLE';
      updateData.completedDate = new Date().toISOString();
      if (data.actualCost !== undefined) updateData.actualCost = data.actualCost;
    } else if (data.status === 'CANCELLED') {
      newAssetStatus = 'AVAILABLE';
    }

    const updated = await repo.updateTicket(client, id, updateData);

    if (newAssetStatus) {
      await repo.updateAssetStatus(client, ticket.raw_asset_id || ticket.asset_id, newAssetStatus);
    }

    // Notification to ticket raiser
    const notifMessages = {
      IN_PROGRESS: { title: 'Maintenance In Progress', message: `Maintenance for ${ticket.asset_name} (${ticket.asset_tag}) is now in progress.` },
      RESOLVED: { title: 'Maintenance Resolved', message: `Maintenance for ${ticket.asset_name} (${ticket.asset_tag}) has been resolved. Asset is now available.` },
      CANCELLED: { title: 'Maintenance Cancelled', message: `Maintenance request for ${ticket.asset_name} (${ticket.asset_tag}) has been cancelled.` }
    };
    const notifData = notifMessages[data.status];
    if (notifData) {
      await repo.createNotification(client, {
        userId: ticket.raised_by_id,
        type: 'MAINTENANCE',
        title: notifData.title,
        message: notifData.message
      });
    }

    await repo.createActivityLog(client, {
      userId: user.id,
      action: `MAINTENANCE_${data.status}`,
      module: 'MAINTENANCE',
      entity: 'maintenance_requests',
      entityId: id,
      metadata: { oldStatus: ticket.status, newStatus: data.status, actualCost: data.actualCost }
    });

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteMaintenance = async (user, id) => {
  const ticket = await repo.getTicketById(id);
  if (!ticket) throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  if (ticket.status !== 'PENDING') {
    throw Object.assign(new Error('Only PENDING tickets can be deleted'), { statusCode: 409 });
  }
  const deleted = await repo.softDeleteTicket(id);
  if (!deleted) throw Object.assign(new Error('Delete failed'), { statusCode: 500 });
  return deleted;
};
