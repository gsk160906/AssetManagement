import { HTTP_STATUS } from '../constants/httpStatus.js';
import { errorResponse } from '../utils/response.js';

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return errorResponse(
      res, 
      'Forbidden: Insufficient permissions to access this resource', 
      {}, 
      HTTP_STATUS.FORBIDDEN
    );
  }
  next();
};

export default authorize;
