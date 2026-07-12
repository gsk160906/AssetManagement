import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import * as authRepository from './auth.repository.js';
import { comparePassword } from '../../utils/password.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { createSession } from '../profile/profile.repository.js';

export const login = async (email, password, clientInfo = {}) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    throw error;
  }

  if (user.status !== 'ACTIVE') {
    const error = new Error('User account is inactive. Please contact your administrator.');
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    throw error;
  }

  // Create a new session in user_sessions
  const sessionId = crypto.randomUUID();
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days matching JWT expiration

  // Parse User Agent
  const ua = clientInfo.userAgent || '';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop';
  const lowercaseUa = ua.toLowerCase();
  
  if (lowercaseUa.includes('firefox')) browser = 'Firefox';
  else if (lowercaseUa.includes('chrome') && !lowercaseUa.includes('chromium')) browser = 'Chrome';
  else if (lowercaseUa.includes('safari') && !lowercaseUa.includes('chrome')) browser = 'Safari';
  else if (lowercaseUa.includes('edge') || lowercaseUa.includes('edg')) browser = 'Edge';
  else if (lowercaseUa.includes('opera') || lowercaseUa.includes('opr')) browser = 'Opera';

  if (lowercaseUa.includes('windows')) os = 'Windows';
  else if (lowercaseUa.includes('macintosh') || lowercaseUa.includes('mac os')) os = 'macOS';
  else if (lowercaseUa.includes('linux')) os = 'Linux';
  else if (lowercaseUa.includes('android')) {
    os = 'Android';
    device = 'Mobile';
  } else if (lowercaseUa.includes('iphone') || lowercaseUa.includes('ipad')) {
    os = 'iOS';
    device = 'Mobile';
  }

  await createSession({
    id: sessionId,
    userId: user.id,
    refreshToken,
    deviceName: device,
    browser,
    operatingSystem: os,
    ipAddress: clientInfo.ipAddress || '127.0.0.1',
    location: 'Unknown',
    expiresAt
  });

  // Generate JWT Token with id, email, role, departmentId, and sessionId
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
    sessionId: sessionId
  };

  const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  // Strip password_hash from returning details
  const { password_hash, ...userDetails } = user;

  return {
    token,
    user: userDetails,
  };
};
