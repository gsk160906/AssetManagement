import * as repo from './notifications.repository.js';

export const getNotifications = async (userId, filters) => {
  return repo.getNotifications(userId, filters);
};

export const getNotificationById = async (id, userId) => {
  const note = await repo.getNotificationById(id);
  if (!note || note.user_id !== userId) {
    throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  }
  return note;
};

export const getUnreadCount = async (userId) => {
  return repo.getUnreadCount(userId);
};

export const markRead = async (id, userId) => {
  await getNotificationById(id, userId); // check exists
  const result = await repo.markRead(id, userId);
  await repo.insertActivityLog(userId, 'NOTIFICATION_READ', id, { title: result.title });
  return result;
};

export const markUnread = async (id, userId) => {
  await getNotificationById(id, userId); // check exists
  return repo.markUnread(id, userId);
};

export const markAllRead = async (userId) => {
  const result = await repo.markAllRead(userId);
  await repo.insertActivityLog(userId, 'NOTIFICATION_READ_ALL', null, { count: result.length });
  return result;
};

export const softDelete = async (id, userId) => {
  await getNotificationById(id, userId); // check exists
  const result = await repo.softDelete(id, userId);
  await repo.insertActivityLog(userId, 'NOTIFICATION_DELETED', id, { title: result?.title });
  return result;
};

export const softDeleteRead = async (userId) => {
  const result = await repo.softDeleteRead(userId);
  await repo.insertActivityLog(userId, 'NOTIFICATION_DELETED_READ', null, { count: result.length });
  return result;
};

export const getPreference = async (userId) => {
  return repo.getPreference(userId);
};

export const updatePreference = async (userId, data) => {
  const result = await repo.updatePreference(userId, data);
  await repo.insertActivityLog(userId, 'NOTIFICATION_PREFERENCES_UPDATED', null, data);
  return result;
};

// ─── Centralized Notification Creator ─────────────────────────────────────────
export const createNotification = async (userId, data) => {
  const prefs = await repo.getPreference(userId);

  // 1. Verify Browser notification preference
  if (!prefs.browser_enabled) {
    return null; // Skip browser insertion
  }

  // 2. Map Category Preferences
  const category = data.category || 'SYSTEM';
  const preferenceMap = {
    ASSET: prefs.asset_enabled,
    MAINTENANCE: prefs.maintenance_enabled,
    BOOKING: prefs.booking_enabled,
    AUDIT: prefs.audit_enabled,
    REPORT: prefs.report_enabled,
    SYSTEM: prefs.system_enabled,
    SECURITY: prefs.system_enabled, // Fallback to system preferences
    TRANSFER: prefs.asset_enabled   // Fallback to asset preferences
  };

  const isEnabled = preferenceMap[category] ?? true;
  if (!isEnabled) {
    return null; // Skip creation if disabled by user preferences
  }

  // 3. Save notification
  const note = await repo.saveNotification({
    userId,
    title: data.title,
    message: data.message,
    category,
    priority: data.priority || 'MEDIUM',
    actionUrl: data.actionUrl,
    actionLabel: data.actionLabel,
    expiresAt: data.expiresAt
  });

  if (note) {
    await repo.insertActivityLog(userId, 'NOTIFICATION_CREATED', note.id, { title: note.title });
  }

  return note;
};
