import * as service from './maintenance.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getMaintenances = asyncHandler(async (req, res) => {
  const result = await service.getMaintenances(req.query);
  return successResponse(res, 'Maintenance tickets retrieved successfully', result, HTTP_STATUS.OK);
});

export const getMaintenanceById = asyncHandler(async (req, res) => {
  const result = await service.getMaintenanceById(req.params.id);
  return successResponse(res, 'Maintenance ticket retrieved', result, HTTP_STATUS.OK);
});

export const getMaintenanceStats = asyncHandler(async (req, res) => {
  const result = await service.getMaintenanceStats();
  return successResponse(res, 'Maintenance statistics retrieved', result, HTTP_STATUS.OK);
});

export const createMaintenance = asyncHandler(async (req, res) => {
  const result = await service.createMaintenance(req.user, req.body);
  return successResponse(res, 'Maintenance ticket created successfully', result, HTTP_STATUS.CREATED);
});

export const updateMaintenance = asyncHandler(async (req, res) => {
  const result = await service.updateMaintenance(req.user, req.params.id, req.body);
  return successResponse(res, 'Maintenance ticket updated successfully', result, HTTP_STATUS.OK);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const result = await service.updateStatus(req.user, req.params.id, req.body);
  return successResponse(res, 'Status updated successfully', result, HTTP_STATUS.OK);
});

export const deleteMaintenance = asyncHandler(async (req, res) => {
  await service.deleteMaintenance(req.user, req.params.id);
  return successResponse(res, 'Maintenance ticket deleted successfully', null, HTTP_STATUS.OK);
});
