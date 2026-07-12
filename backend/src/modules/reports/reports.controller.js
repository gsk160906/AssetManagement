import * as service from './reports.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { REPORT_TYPES } from './reports.constants.js';

// Access Check Helper
const checkReportAccess = (user, type) => {
  const role = user.role;
  if (role === 'ADMIN') return true;

  if (type === 'EXPENSE_REPORT') {
    return role === 'FINANCE_MANAGER';
  }

  if (['ASSET_REPORT', 'MAINTENANCE_REPORT', 'AUDIT_REPORT'].includes(type)) {
    return role === 'ASSET_MANAGER';
  }

  if (type === 'BOOKING_REPORT') {
    return true; // Everyone can access, scoped in query
  }

  return false;
};

export const getAvailableReports = asyncHandler(async (req, res) => {
  // Filter available reports based on role permissions
  const list = Object.values(REPORT_TYPES).filter(r => checkReportAccess(req.user, r.type));
  return successResponse(res, 'Available reports list retrieved', { reports: list }, HTTP_STATUS.OK);
});

export const getAssetReport = asyncHandler(async (req, res) => {
  if (!checkReportAccess(req.user, 'ASSET_REPORT')) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: Asset reports require Admin or Asset Manager privileges.' });
  }
  const result = await service.getAssetReport(req.query);
  return successResponse(res, 'Asset report generated successfully', result, HTTP_STATUS.OK);
});

export const getMaintenanceReport = asyncHandler(async (req, res) => {
  if (!checkReportAccess(req.user, 'MAINTENANCE_REPORT')) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: Maintenance reports require Admin or Asset Manager privileges.' });
  }
  const result = await service.getMaintenanceReport(req.query);
  return successResponse(res, 'Maintenance report generated successfully', result, HTTP_STATUS.OK);
});

export const getAuditReport = asyncHandler(async (req, res) => {
  if (!checkReportAccess(req.user, 'AUDIT_REPORT')) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: Audit reports require Admin or Asset Manager privileges.' });
  }
  const result = await service.getAuditReport(req.query);
  return successResponse(res, 'Audit report generated successfully', result, HTTP_STATUS.OK);
});

export const getBookingReport = asyncHandler(async (req, res) => {
  const filters = { ...req.query };
  if (req.user.role === 'EMPLOYEE') {
    filters.employeeId = req.user.id;
  }
  const result = await service.getBookingReport(filters);
  return successResponse(res, 'Booking report generated successfully', result, HTTP_STATUS.OK);
});

export const getExpenseReport = asyncHandler(async (req, res) => {
  if (!checkReportAccess(req.user, 'EXPENSE_REPORT')) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: Expense reports require Admin or Finance Manager privileges.' });
  }
  const result = await service.getExpenseReport(req.query);
  return successResponse(res, 'Expense report generated successfully', result, HTTP_STATUS.OK);
});

export const exportReport = asyncHandler(async (req, res) => {
  const { type, format, filters = {} } = req.body;

  if (!checkReportAccess(req.user, type)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied to export this report type.' });
  }

  const queryFilters = { ...filters };
  if (req.user.role === 'EMPLOYEE' && type === 'BOOKING_REPORT') {
    queryFilters.employeeId = req.user.id;
  }

  let result;
  if (format === 'CSV') {
    result = await service.exportCSV(type, queryFilters, req.user.id);
  } else {
    result = await service.exportPDF(type, queryFilters, req.user.id);
  }

  return successResponse(res, 'Report exported successfully', result, HTTP_STATUS.OK);
});

export const getReportHistory = asyncHandler(async (req, res) => {
  const result = await service.getReportHistory();
  return successResponse(res, 'Report download history retrieved', { history: result }, HTTP_STATUS.OK);
});
