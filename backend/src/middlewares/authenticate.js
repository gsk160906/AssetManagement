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
      'SELECT id, employee_code, name, email, department_id, role, status, profile_image_url FROM users WHERE id = $1 AND is_deleted = false',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Unauthorized: User account not found', {}, HTTP_STATUS.UNAUTHORIZED);
    }

    const user = result.rows[0];
    if (user.status !== 'ACTIVE') {
      return errorResponse(res, 'Unauthorized: User account is inactive', {}, HTTP_STATUS.UNAUTHORIZED);
    }

    // Verify session if sessionId is in token
    if (decoded.sessionId) {
      const sessionResult = await pool.query(
        'SELECT id, expires_at FROM user_sessions WHERE id = $1 AND user_id = $2',
        [decoded.sessionId, user.id]
      );

      if (sessionResult.rows.length === 0) {
        return errorResponse(
          res, 
          'Unauthorized: Active session not found or terminated', 
          { code: 'SESSION_TERMINATED' }, 
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const session = sessionResult.rows[0];
      if (new Date(session.expires_at) < new Date()) {
        return errorResponse(
          res, 
          'Unauthorized: Session has expired', 
          { code: 'SESSION_EXPIRED' }, 
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      // Update last activity timestamp asynchronously
      pool.query('UPDATE user_sessions SET last_activity = NOW() WHERE id = $1', [decoded.sessionId])
        .catch(err => console.error('Failed to update session activity:', err));

      req.sessionId = decoded.sessionId;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
