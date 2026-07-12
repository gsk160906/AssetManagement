import * as dashboardService from './dashboard.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getOverview = asyncHandler(async (req, res) => {
  const result = await dashboardService.getOverview(req.user);
  return successResponse(res, 'Overview statistics retrieved', result, HTTP_STATUS.OK);
});

export const getCharts = asyncHandler(async (req, res) => {
  const result = await dashboardService.getCharts(req.user);
  return successResponse(res, 'Charts analytics retrieved', result, HTTP_STATUS.OK);
});

export const getActivities = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || 1, 10);
  const limit = parseInt(req.query.limit || 10, 10);
  const range = req.query.range || '30d';
  const offset = (page - 1) * limit;

  const result = await dashboardService.getActivities(req.user, limit, offset, range);
  return successResponse(res, 'Recent activities retrieved', result, HTTP_STATUS.OK);
});

export const getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || 1, 10);
  const limit = parseInt(req.query.limit || 5, 10);
  const offset = (page - 1) * limit;

  const result = await dashboardService.getBookings(req.user, limit, offset);
  return successResponse(res, 'Upcoming bookings retrieved', result, HTTP_STATUS.OK);
});

export const getMaintenance = asyncHandler(async (req, res) => {
  const result = await dashboardService.getMaintenance(req.user);
  return successResponse(res, 'Maintenance overview retrieved', result, HTTP_STATUS.OK);
});

export const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || 1, 10);
  const limit = parseInt(req.query.limit || 5, 10);
  const offset = (page - 1) * limit;

  const result = await dashboardService.getNotifications(req.user, limit, offset);
  return successResponse(res, 'Notifications retrieved', result, HTTP_STATUS.OK);
});
