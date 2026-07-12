import * as authService from './auth.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import pool from '../../db/index.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  // Return standard success payload
  return successResponse(
    res, 
    'Login successful', 
    { 
      token: result.token, 
      user: result.user 
    }, 
    HTTP_STATUS.OK
  );
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user has already been loaded and attached in the authenticate middleware
  return successResponse(res, 'Profile retrieved successfully', { user: req.user }, HTTP_STATUS.OK);
});

export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, 'Logout successful', {}, HTTP_STATUS.OK);
});

export const getUsers = asyncHandler(async (req, res) => {
  const { role, status = 'ACTIVE' } = req.query;
  const values = [status];
  let query = `SELECT id, employee_code, name, email, role, department_id FROM users WHERE status = $1 AND is_deleted = FALSE`;
  if (role) {
    values.push(role);
    query += ` AND role = $${values.length}`;
  }
  query += ` ORDER BY name ASC`;
  const { rows } = await pool.query(query, values);
  return successResponse(res, 'Users retrieved successfully', { users: rows }, HTTP_STATUS.OK);
});

