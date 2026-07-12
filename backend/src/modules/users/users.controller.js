import * as userService from './users.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status, departmentId, page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const result = await userService.listUsers(
    { search, role, status, departmentId },
    { limit: limitNum, offset }
  );

  return successResponse(
    res,
    'Users retrieved successfully',
    {
      users: result.users,
      pagination: {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum)
      }
    },
    HTTP_STATUS.OK
  );
});

export const createUser = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body);
  return successResponse(res, 'User created successfully', { user: result }, HTTP_STATUS.CREATED);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await userService.updateUser(id, req.body);
  return successResponse(res, 'User updated successfully', { user: result }, HTTP_STATUS.OK);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (id === req.user.id) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Self-deletion is prohibited.'
    });
  }

  await userService.deleteUser(id);
  return successResponse(res, 'User deleted successfully', {}, HTTP_STATUS.OK);
});
