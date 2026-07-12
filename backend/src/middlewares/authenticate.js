import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import pool from '../db/index.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(
        res, 
        'Unauthorized: Access token missing or invalid format', 
        {}, 
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(
          res, 
          'Unauthorized: Access token has expired', 
          { code: 'TOKEN_EXPIRED' }, 
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return errorResponse(
        res, 
        'Unauthorized: Access token is invalid', 
        {}, 
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Load current user from DB to verify latest status
    const result = await pool.query(
      'SELECT id, employee_code, name, email, department_id, role, status FROM users WHERE id = $1 AND is_deleted = false',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Unauthorized: User account not found', {}, HTTP_STATUS.UNAUTHORIZED);
    }

    const user = result.rows[0];
    if (user.status !== 'ACTIVE') {
      return errorResponse(res, 'Unauthorized: User account is inactive', {}, HTTP_STATUS.UNAUTHORIZED);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
