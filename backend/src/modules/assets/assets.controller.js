import * as assetsService from './assets.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getAssets = asyncHandler(async (req, res) => {
  const result = await assetsService.getAssets(req.query);
  return successResponse(res, 'Assets retrieved successfully', result, HTTP_STATUS.OK);
});

export const getAssetById = asyncHandler(async (req, res) => {
  const result = await assetsService.getAssetById(req.params.id);
  if (!result) {
    return errorResponse(res, 'Asset not found', HTTP_STATUS.NOT_FOUND);
  }
  return successResponse(res, 'Asset retrieved successfully', result, HTTP_STATUS.OK);
});

export const createAsset = asyncHandler(async (req, res) => {
  const result = await assetsService.createAsset(req.user, req.body);
  return successResponse(res, 'Asset created successfully', result, HTTP_STATUS.CREATED);
});

export const updateAsset = asyncHandler(async (req, res) => {
  const result = await assetsService.updateAsset(req.user, req.params.id, req.body);
  return successResponse(res, 'Asset updated successfully', result, HTTP_STATUS.OK);
});

export const deleteAsset = asyncHandler(async (req, res) => {
  await assetsService.deleteAsset(req.user, req.params.id);
  return successResponse(res, 'Asset deleted successfully', null, HTTP_STATUS.OK);
});

export const duplicateAsset = asyncHandler(async (req, res) => {
  const result = await assetsService.duplicateAsset(req.user, req.params.id);
  return successResponse(res, 'Asset duplicated successfully', result, HTTP_STATUS.CREATED);
});

export const archiveAsset = asyncHandler(async (req, res) => {
  const result = await assetsService.archiveAsset(req.user, req.params.id, req.body.status);
  return successResponse(res, 'Asset archived successfully', result, HTTP_STATUS.OK);
});

// Allocation controllers
export const allocateAsset = asyncHandler(async (req, res) => {
  const result = await assetsService.allocateAsset(req.user, req.params.id, req.body);
  return successResponse(res, 'Asset allocated successfully', result, HTTP_STATUS.CREATED);
});

export const returnAsset = asyncHandler(async (req, res) => {
  const result = await assetsService.returnAsset(req.user, req.params.id, req.body);
  return successResponse(res, 'Asset returned successfully', result, HTTP_STATUS.OK);
});

export const extendAllocation = asyncHandler(async (req, res) => {
  const result = await assetsService.extendAllocation(req.user, req.params.id, req.body.expected_return_date);
  return successResponse(res, 'Allocation extension saved', result, HTTP_STATUS.OK);
});

export const getAllocationHistory = asyncHandler(async (req, res) => {
  const result = await assetsService.getAllocationHistory(req.params.id);
  return successResponse(res, 'Allocation history retrieved', result, HTTP_STATUS.OK);
});

// Transfer controllers
export const requestTransfer = asyncHandler(async (req, res) => {
  const result = await assetsService.requestTransfer(req.user, req.params.id, req.body);
  return successResponse(res, 'Transfer request submitted', result, HTTP_STATUS.CREATED);
});

export const approveTransfer = asyncHandler(async (req, res) => {
  const result = await assetsService.approveTransfer(req.user, req.params.id);
  return successResponse(res, 'Transfer approved successfully', result, HTTP_STATUS.OK);
});

export const rejectTransfer = asyncHandler(async (req, res) => {
  const result = await assetsService.rejectTransfer(req.user, req.params.id, req.body.remarks);
  return successResponse(res, 'Transfer request rejected', result, HTTP_STATUS.OK);
});

export const completeTransfer = asyncHandler(async (req, res) => {
  const result = await assetsService.completeTransfer(req.user, req.params.id);
  return successResponse(res, 'Transfer executed and completed', result, HTTP_STATUS.OK);
});

export const getTransferHistory = asyncHandler(async (req, res) => {
  const result = await assetsService.getTransferHistory(req.params.id);
  return successResponse(res, 'Transfer history retrieved', result, HTTP_STATUS.OK);
});

// Maintenance controllers
export const createMaintenance = asyncHandler(async (req, res) => {
  const result = await assetsService.createMaintenance(req.user, req.params.id, req.body);
  return successResponse(res, 'Maintenance ticket created', result, HTTP_STATUS.CREATED);
});

export const assignTechnician = asyncHandler(async (req, res) => {
  const result = await assetsService.assignTechnician(req.user, req.params.id, req.body.assigned_technician_id);
  return successResponse(res, 'Technician assigned successfully', result, HTTP_STATUS.OK);
});

export const updateMaintenance = asyncHandler(async (req, res) => {
  const result = await assetsService.updateMaintenance(req.user, req.params.id, req.body);
  return successResponse(res, 'Maintenance ticket updated', result, HTTP_STATUS.OK);
});

export const resolveMaintenance = asyncHandler(async (req, res) => {
  const result = await assetsService.resolveMaintenance(req.user, req.params.id, req.body);
  return successResponse(res, 'Maintenance ticket marked as resolved', result, HTTP_STATUS.OK);
});

export const getMaintenanceHistory = asyncHandler(async (req, res) => {
  const result = await assetsService.getMaintenanceHistory(req.params.id);
  return successResponse(res, 'Maintenance history retrieved', result, HTTP_STATUS.OK);
});

// Warranty controllers
export const getExpiringWarranties = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days || 30, 10);
  const result = await assetsService.getExpiringWarranties(days);
  return successResponse(res, 'Expiring warranties retrieved', result, HTTP_STATUS.OK);
});

export const getExpiredWarranties = asyncHandler(async (req, res) => {
  const result = await assetsService.getExpiredWarranties();
  return successResponse(res, 'Expired warranties retrieved', result, HTTP_STATUS.OK);
});

// Timeline controllers
export const getAssetTimeline = asyncHandler(async (req, res) => {
  const result = await assetsService.getAssetTimeline(req.params.id);
  return successResponse(res, 'Asset lifecycle timeline retrieved', result, HTTP_STATUS.OK);
});

// QR Code controllers
export const generateQRCode = asyncHandler(async (req, res) => {
  const qrDataUri = await assetsService.generateQRCode(req.params.id);
  return successResponse(res, 'QR Code generated', { qrCode: qrDataUri }, HTTP_STATUS.OK);
});

// Bulk controllers
export const bulkImport = asyncHandler(async (req, res) => {
  const result = await assetsService.bulkImport(req.user, req.body.assets);
  return successResponse(res, 'Bulk import executed successfully', result, HTTP_STATUS.CREATED);
});

export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const result = await assetsService.bulkUpdateStatus(req.user, req.body.ids, req.body.status);
  return successResponse(res, 'Bulk status update completed', result, HTTP_STATUS.OK);
});

export const bulkDelete = asyncHandler(async (req, res) => {
  const result = await assetsService.bulkDelete(req.user, req.body.ids);
  return successResponse(res, 'Bulk delete completed', result, HTTP_STATUS.OK);
});

// Document controllers
export const createDocument = asyncHandler(async (req, res) => {
  const result = await assetsService.createDocument(req.user, req.params.id, req.body);
  return successResponse(res, 'Document link added successfully', result, HTTP_STATUS.CREATED);
});

export const getDocuments = asyncHandler(async (req, res) => {
  const result = await assetsService.getDocuments(req.params.id);
  return successResponse(res, 'Asset documents retrieved', result, HTTP_STATUS.OK);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  await assetsService.deleteDocument(req.user, req.params.id);
  return successResponse(res, 'Document attachment deleted', null, HTTP_STATUS.OK);
});
