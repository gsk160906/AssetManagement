import * as service from './audits.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createAudit = asyncHandler(async (req, res) => {
  const result = await service.createAudit(req.user, req.body);
  return successResponse(res, 'Audit created successfully', { audit: result }, HTTP_STATUS.CREATED);
});

export const getAudits = asyncHandler(async (req, res) => {
  const result = await service.getAudits(req.query);
  return successResponse(res, 'Audits retrieved successfully', result, HTTP_STATUS.OK);
});

export const getAuditById = asyncHandler(async (req, res) => {
  const result = await service.getAuditById(req.params.id);
  return successResponse(res, 'Audit details retrieved successfully', { audit: result }, HTTP_STATUS.OK);
});

export const startAudit = asyncHandler(async (req, res) => {
  await service.startAudit(req.user, req.params.id);
  return successResponse(res, 'Audit session started successfully', null, HTTP_STATUS.OK);
});

export const verifyAsset = asyncHandler(async (req, res) => {
  const result = await service.verifyAsset(req.user, req.params.auditId, req.params.assetId, req.body);
  return successResponse(res, 'Asset verification status updated successfully', { verification: result }, HTTP_STATUS.OK);
});

export const bulkVerifyAssets = asyncHandler(async (req, res) => {
  const result = await service.bulkVerifyAssets(req.user, req.params.id, req.body);
  return successResponse(res, 'Bulk asset verifications completed successfully', { verifications: result }, HTTP_STATUS.OK);
});

export const completeAudit = asyncHandler(async (req, res) => {
  await service.completeAudit(req.user, req.params.id);
  return successResponse(res, 'Audit completed successfully', null, HTTP_STATUS.OK);
});

export const cancelAudit = asyncHandler(async (req, res) => {
  await service.cancelAudit(req.user, req.params.id);
  return successResponse(res, 'Audit cancelled successfully', null, HTTP_STATUS.OK);
});

export const getAuditProgress = asyncHandler(async (req, res) => {
  const result = await service.getAuditProgress(req.params.id);
  return successResponse(res, 'Audit progress statistics retrieved successfully', result, HTTP_STATUS.OK);
});

export const getAuditReport = asyncHandler(async (req, res) => {
  const result = await service.getAuditReport(req.params.id);
  return successResponse(res, 'Audit report details retrieved successfully', result, HTTP_STATUS.OK);
});

export const getAuditItemsList = asyncHandler(async (req, res) => {
  const result = await service.getAuditItemsList(req.params.id, req.query);
  return successResponse(res, 'Audit verification items retrieved successfully', { items: result }, HTTP_STATUS.OK);
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await service.getAuditLogs(req.params.id);
  return successResponse(res, 'Audit log history retrieved successfully', { logs: result }, HTTP_STATUS.OK);
});
