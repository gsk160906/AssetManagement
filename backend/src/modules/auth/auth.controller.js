import * as authService from './auth.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

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
