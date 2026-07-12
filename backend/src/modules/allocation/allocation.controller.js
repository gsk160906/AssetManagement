import * as service from './allocation.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getAllocations = asyncHandler(async (req, res) => {
  const result = await service.getAllocations(req.query);
  return successResponse(res, 'Allocations retrieved successfully', result, HTTP_STATUS.OK);
});

export const allocateAsset = asyncHandler(async (req, res) => {
  const result = await service.allocateAsset(req.user, req.body);
  return successResponse(res, 'Asset allocated successfully', result, HTTP_STATUS.CREATED);
});

export const returnAsset = asyncHandler(async (req, res) => {
  const result = await service.returnAsset(req.user, req.params.id, req.body);
  return successResponse(res, 'Asset returned successfully', result, HTTP_STATUS.OK);
});

export const transferAsset = asyncHandler(async (req, res) => {
  const result = await service.transferAsset(req.user, req.body);
  return successResponse(res, 'Transfer completed successfully', result, HTTP_STATUS.OK);
});

export const getAssetHistory = asyncHandler(async (req, res) => {
  const result = await service.getAssetHistory(req.params.assetId);
  return successResponse(res, 'Allocation history retrieved', result, HTTP_STATUS.OK);
});

export const getEmployeeAssets = asyncHandler(async (req, res) => {
  const result = await service.getEmployeeAssets(req.params.employeeId);
  return successResponse(res, 'Employee assets retrieved', result, HTTP_STATUS.OK);
});
