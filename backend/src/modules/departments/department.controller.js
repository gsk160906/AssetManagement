import * as service from './department.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Access Control Helper
const checkDeptAccess = (user, deptId) => {
  if (['ADMIN', 'ASSET_MANAGER'].includes(user.role)) return true;
  return user.department_id === deptId;
};

export const getDepartments = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let filters = { ...req.query };

  // If normal employee, scope to their own department
  if (!['ADMIN', 'ASSET_MANAGER'].includes(role)) {
    if (!req.user.department_id) {
      return successResponse(res, 'Departments retrieved (empty)', { departments: [] }, HTTP_STATUS.OK);
    }
    const dept = await service.getDepartmentById(req.user.department_id);
    return successResponse(res, 'Departments retrieved (scoped)', { departments: [dept] }, HTTP_STATUS.OK);
  }

  const list = await service.getDepartments(filters);
  return successResponse(res, 'Departments list retrieved successfully', { departments: list }, HTTP_STATUS.OK);
});

export const getDepartmentTree = asyncHandler(async (req, res) => {
  const role = req.user.role;
  if (!['ADMIN', 'ASSET_MANAGER'].includes(role)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied to department hierarchy tree.' });
  }
  const tree = await service.getDepartmentTree();
  return successResponse(res, 'Department hierarchy tree retrieved', { tree }, HTTP_STATUS.OK);
});

export const getDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await service.getDepartmentStats();
  return successResponse(res, 'Department stats retrieved successfully', { stats }, HTTP_STATUS.OK);
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!checkDeptAccess(req.user, id)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: You can only view details for your assigned department.' });
  }
  const dept = await service.getDepartmentById(id);
  return successResponse(res, 'Department details retrieved', { department: dept }, HTTP_STATUS.OK);
});

export const getDepartmentEmployees = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!checkDeptAccess(req.user, id)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied.' });
  }
  const employees = await service.getDepartmentEmployees(id);
  return successResponse(res, 'Department employees list retrieved', { employees }, HTTP_STATUS.OK);
});

export const getDepartmentAssets = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!checkDeptAccess(req.user, id)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied.' });
  }
  const assets = await service.getDepartmentAssets(id);
  return successResponse(res, 'Department assets list retrieved', { assets }, HTTP_STATUS.OK);
});

export const createDepartment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Only administrators can create departments.' });
  }
  const dept = await service.createDepartment(req.body, req.user.id);
  return successResponse(res, 'Department created successfully', { department: dept }, HTTP_STATUS.CREATED);
});

export const updateDepartment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Only administrators can edit departments.' });
  }
  const { id } = req.params;
  const dept = await service.updateDepartment(id, req.body, req.user.id);
  return successResponse(res, 'Department updated successfully', { department: dept }, HTTP_STATUS.OK);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Only administrators can delete departments.' });
  }
  const { id } = req.params;
  await service.deleteDepartment(id, req.user.id);
  return successResponse(res, 'Department deleted successfully', {}, HTTP_STATUS.OK);
});
