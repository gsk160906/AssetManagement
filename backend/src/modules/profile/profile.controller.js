import * as service from './profile.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await service.getProfile(req.user.id);
  return successResponse(res, 'Profile retrieved successfully', { profile }, HTTP_STATUS.OK);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await service.updateProfile(req.user.id, req.body);
  return successResponse(res, 'Profile updated successfully', { profile }, HTTP_STATUS.OK);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const result = await service.uploadAvatar(req.user.id, req.file);
  return successResponse(res, 'Profile picture uploaded successfully', result, HTTP_STATUS.OK);
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  const result = await service.deleteAvatar(req.user.id);
  return successResponse(res, 'Profile picture deleted successfully', result, HTTP_STATUS.OK);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await service.changePassword(req.user.id, currentPassword, newPassword);
  return successResponse(res, 'Password changed successfully', result, HTTP_STATUS.OK);
});

export const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await service.getPreferences(req.user.id);
  return successResponse(res, 'Preferences retrieved successfully', { preferences }, HTTP_STATUS.OK);
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await service.updatePreferences(req.user.id, req.body);
  return successResponse(res, 'Preferences updated successfully', { preferences }, HTTP_STATUS.OK);
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await service.getSessions(req.user.id);
  
  // Format to separate current session from other active sessions
  const formattedSessions = sessions.map(s => ({
    ...s,
    isCurrent: s.id === req.sessionId
  }));

  const current = formattedSessions.find(s => s.isCurrent) || null;
  const others = formattedSessions.filter(s => !s.isCurrent);

  return successResponse(
    res, 
    'Active sessions retrieved successfully', 
    { current, others }, 
    HTTP_STATUS.OK
  );
});

export const logoutCurrentSession = asyncHandler(async (req, res) => {
  if (!req.sessionId) {
    throw new Error('No active session associated with this request');
  }
  const result = await service.logoutSession(req.sessionId, req.user.id);
  return successResponse(res, 'Logged out from current session successfully', result, HTTP_STATUS.OK);
});

export const logoutAllSessions = asyncHandler(async (req, res) => {
  // Option: delete all sessions, optionally keeping the current one.
  // The requirement says "Logout all devices: Delete every session except current one if configured, or remove all sessions based on business requirement."
  // Let's delete all other sessions and keep the current active one! That is extremely convenient for the user.
  const result = await service.logoutAllSessions(req.user.id, req.sessionId);
  return successResponse(res, 'All other active sessions have been terminated successfully', result, HTTP_STATUS.OK);
});
