import pool from '../../db/index.js';
import * as repo from './booking.repository.js';

// Category-specific maximum duration validation helper
const checkBookingDurationLimit = (categoryName, start, end) => {
  const durationMs = new Date(end) - new Date(start);
  const durationHours = durationMs / (1000 * 60 * 60);

  if (categoryName) {
    const catLower = categoryName.toLowerCase();
    if (catLower.includes('vehicle')) {
      if (durationHours > 72) throw Object.assign(new Error('Company vehicles can only be booked for a maximum of 3 days.'), { statusCode: 400 });
    } else if (catLower.includes('projector')) {
      if (durationHours > 8) throw Object.assign(new Error('Projectors can only be booked for a maximum of 8 hours.'), { statusCode: 400 });
    } else if (catLower.includes('acoustic') || catLower.includes('pod') || catLower.includes('furniture')) {
      if (durationHours > 4) throw Object.assign(new Error('Acoustic pods can only be booked for a maximum of 4 hours.'), { statusCode: 400 });
    }
  }

  // General fallback limit of 24 hours for other assets
  if (durationHours > 24 && !categoryName?.toLowerCase().includes('vehicle')) {
    throw Object.assign(new Error('Shared assets can only be booked for a maximum of 24 hours.'), { statusCode: 400 });
  }
};

export const getBookings = async (filters) => {
  await repo.syncBookingStatuses(); // Auto-update status first
  const [bookings, total] = await Promise.all([
    repo.getBookings(filters),
    repo.getBookingsCount(filters)
  ]);
  return { bookings, total, page: parseInt(filters.page || 1, 10), limit: parseInt(filters.limit || 10, 10) };
};

export const getBookingById = async (id) => {
  await repo.syncBookingStatuses();
  const booking = await repo.getBookingById(id);
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  return booking;
};

export const getAvailableResources = async (startTime, endTime) => {
  if (new Date(startTime) < new Date()) {
    throw Object.assign(new Error('Cannot check availability for past dates'), { statusCode: 400 });
  }
  if (new Date(endTime) <= new Date(startTime)) {
    throw Object.assign(new Error('End time must be after start time'), { statusCode: 400 });
  }
  return repo.getAvailableResources(startTime, endTime);
};

export const getBookingStats = async () => {
  await repo.syncBookingStatuses();
  return repo.getBookingStats();
};

export const getCalendarEvents = async (filters) => {
  await repo.syncBookingStatuses();
  return repo.getCalendarEvents(filters);
};

export const createBooking = async (user, data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  if (start < new Date()) {
    throw Object.assign(new Error('Cannot reserve resource for past dates.'), { statusCode: 400 });
  }
  if (end <= start) {
    throw Object.assign(new Error('End time must be strictly after start time.'), { statusCode: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch asset details & verify bookability
    const assetRes = await client.query(`
      SELECT a.id, a.name, a.asset_tag, a.is_shared_bookable, a.status, c.name AS category_name
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      WHERE a.id = $1 AND a.is_deleted = FALSE
    `, [data.resourceId]);

    const asset = assetRes.rows[0];
    if (!asset) throw Object.assign(new Error('Target resource not found.'), { statusCode: 404 });

    if (!asset.is_shared_bookable) {
      throw Object.assign(new Error('This asset is not configured for public booking.'), { statusCode: 400 });
    }
    if (asset.status !== 'AVAILABLE') {
      throw Object.assign(new Error(`Resource is currently marked as ${asset.status.replace(/_/g, ' ')}. Only AVAILABLE assets can be booked.`), { statusCode: 400 });
    }

    // 2. Validate duration limits
    checkBookingDurationLimit(asset.category_name, start, end);

    // 3. Detect conflicts (overlapping bookings)
    const overlaps = await repo.checkOverlappingBookings(client, data.resourceId, data.startTime, data.endTime);
    if (overlaps.length > 0) {
      // Create conflict log
      await repo.createActivityLog(client, {
        userId: user.id,
        action: 'BOOKING_CONFLICT',
        module: 'BOOKINGS',
        entity: 'resource_bookings',
        entityId: data.resourceId,
        metadata: { startTime: data.startTime, endTime: data.endTime }
      });
      throw Object.assign(new Error('Double booking conflict detected. This resource is already reserved during the requested period.'), { statusCode: 409 });
    }

    // 4. Create booking
    const booking = await repo.createBooking(client, {
      resourceId: data.resourceId,
      employeeId: user.id,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
      notes: data.notes
    });

    // 5. Send booking confirmation notification to current user
    const formattedDate = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const formattedTime = `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    
    await repo.createNotification(client, {
      userId: user.id,
      type: 'BOOKING',
      title: 'Booking Confirmed',
      message: `${asset.name} has been booked successfully for ${formattedDate} (${formattedTime}).`
    });

    // 6. Log Activity
    await repo.createActivityLog(client, {
      userId: user.id,
      action: 'BOOK_RESOURCE',
      module: 'BOOKINGS',
      entity: 'resource_bookings',
      entityId: booking.id,
      metadata: { assetTag: asset.asset_tag, startTime: data.startTime, durationHours: (end - start) / 3600000 }
    });

    await client.query('COMMIT');
    return booking;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateBooking = async (user, id, data) => {
  const booking = await repo.getBookingById(id);
  if (!booking) throw Object.assign(new Error('Booking not found.'), { statusCode: 404 });

  // Access check
  if (user.role !== 'ADMIN' && user.role !== 'ASSET_MANAGER' && booking.employee_id !== user.id) {
    throw Object.assign(new Error('Unauthorized to modify this reservation.'), { statusCode: 403 });
  }

  // Prevent modifying past/completed/cancelled bookings
  if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
    throw Object.assign(new Error(`Cannot modify a booking that is already ${booking.status.toLowerCase()}.`), { statusCode: 400 });
  }

  const start = data.startTime ? new Date(data.startTime) : new Date(booking.start_time);
  const end = data.endTime ? new Date(data.endTime) : new Date(booking.end_time);

  if (end <= start) {
    throw Object.assign(new Error('End time must be after start time.'), { statusCode: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Category duration check
    checkBookingDurationLimit(booking.category_name, start, end);

    // Overlap checks
    if (data.startTime || data.endTime) {
      const overlaps = await repo.checkOverlappingBookings(client, booking.asset_id, start.toISOString(), end.toISOString(), id);
      if (overlaps.length > 0) {
        throw Object.assign(new Error('Conflict: The resource is already reserved during the updated schedule.'), { statusCode: 409 });
      }
    }

    const updated = await repo.updateBooking(client, id, {
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
      notes: data.notes,
      status: data.status
    });

    // Notify user
    await repo.createNotification(client, {
      userId: booking.employee_id,
      type: 'BOOKING',
      title: 'Booking Updated',
      message: `Your reservation schedule for ${booking.asset_name} has been updated.`
    });

    // Log Activity
    await repo.createActivityLog(client, {
      userId: user.id,
      action: 'UPDATE_BOOKING',
      module: 'BOOKINGS',
      entity: 'resource_bookings',
      entityId: id,
      metadata: { assetTag: booking.asset_tag, startTime: start.toISOString() }
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

export const cancelBooking = async (user, id) => {
  const booking = await repo.getBookingById(id);
  if (!booking) throw Object.assign(new Error('Booking not found.'), { statusCode: 404 });

  // Access check
  if (user.role !== 'ADMIN' && user.role !== 'ASSET_MANAGER' && booking.employee_id !== user.id) {
    throw Object.assign(new Error('Unauthorized to cancel this reservation.'), { statusCode: 403 });
  }

  if (booking.status === 'CANCELLED') {
    throw Object.assign(new Error('Booking is already cancelled.'), { statusCode: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await repo.softDeleteBooking(client, id);

    // Notify user
    await repo.createNotification(client, {
      userId: booking.employee_id,
      type: 'BOOKING',
      title: 'Booking Cancelled',
      message: `Your reservation for ${booking.asset_name} has been cancelled.`
    });

    // Log Activity
    await repo.createActivityLog(client, {
      userId: user.id,
      action: 'CANCEL_BOOKING',
      module: 'BOOKINGS',
      entity: 'resource_bookings',
      entityId: id,
      metadata: { assetTag: booking.asset_tag }
    });

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
