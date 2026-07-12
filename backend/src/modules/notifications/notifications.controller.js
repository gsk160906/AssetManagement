import * as service from './notifications.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await service.getNotifications(req.user.id, req.query);
  return successResponse(res, 'Notifications list retrieved successfully', result, HTTP_STATUS.OK);
});

export const getNotificationCount = asyncHandler(async (req, res) => {
  const result = await service.getUnreadCount(req.user.id);
  return successResponse(res, 'Notifications count retrieved', result, HTTP_STATUS.OK);
});

export const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await service.getNotificationById(id, req.user.id);
  return successResponse(res, 'Notification details retrieved', { notification: result }, HTTP_STATUS.OK);
});

export const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await service.markRead(id, req.user.id);
  return successResponse(res, 'Notification marked as read', { notification: result }, HTTP_STATUS.OK);
});

export const markUnread = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await service.markUnread(id, req.user.id);
  return successResponse(res, 'Notification marked as unread', { notification: result }, HTTP_STATUS.OK);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await service.markAllRead(req.user.id);
  return successResponse(res, 'All notifications marked as read', {}, HTTP_STATUS.OK);
});

export const softDelete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await service.softDelete(id, req.user.id);
  return successResponse(res, 'Notification deleted successfully', {}, HTTP_STATUS.OK);
});

export const softDeleteRead = asyncHandler(async (req, res) => {
  await service.softDeleteRead(req.user.id);
  return successResponse(res, 'All read notifications deleted successfully', {}, HTTP_STATUS.OK);
});

export const getPreferences = asyncHandler(async (req, res) => {
  const result = await service.getPreference(req.user.id);
  return successResponse(res, 'Notification preferences retrieved', { preferences: result }, HTTP_STATUS.OK);
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const result = await service.updatePreference(req.user.id, req.body);
  return successResponse(res, 'Notification preferences updated successfully', { preferences: result }, HTTP_STATUS.OK);
});
