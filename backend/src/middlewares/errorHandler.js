import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';
import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;
  let errors = {};

  // Log error using utility logger
  logger.error(`${req.method} ${req.originalUrl} - Error details:`, err);

  // Parse Zod errors
  if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = MESSAGES.VALIDATION_ERROR;
    errors = err.errors.reduce((acc, current) => {
      const field = current.path.join('.');
      acc[field] = current.message;
      return acc;
    }, {});
  } else if (err.errors) {
    errors = err.errors;
  }

  // Include stack details only in development
  const responsePayload = env.NODE_ENV === 'development'
    ? { ...errors, stack: err.stack }
    : errors;

  errorResponse(res, message, responsePayload, statusCode);
};

export default errorHandler;
