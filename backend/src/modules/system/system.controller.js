import * as systemService from './system.service.js';
import { successResponse } from '../../utils/response.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getSetupStatus = asyncHandler(async (req, res) => {
  const result = await systemService.getSetupStatus();
  return successResponse(res, 'Setup status retrieved successfully', result, HTTP_STATUS.OK);
});

export const initializeSystem = asyncHandler(async (req, res) => {
  const clientInfo = {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown'
  };

  try {
    const result = await systemService.initializeSystem(req.body, clientInfo);
    return successResponse(
      res,
      'System initialized successfully',
      result,
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    if (error.status === 409) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: error.message
      });
    }
    throw error;
  }
});
