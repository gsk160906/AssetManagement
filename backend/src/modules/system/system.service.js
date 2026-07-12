import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import * as repo from './system.repository.js';

export const getSetupStatus = async () => {
  const initialized = await repo.hasAdmin();
  return { initialized };
};

export const initializeSystem = async (data, clientInfo = {}) => {
  // Validate if already initialized first
  const alreadyInitialized = await repo.hasAdmin();
  if (alreadyInitialized) {
    const error = new Error('System has already been initialized.');
    error.status = 409;
    throw error;
  }

  const { organizationName, name, email, password } = data;

  const userId = crypto.randomUUID();
  const employeeCode = 'EMP-000';
  const passwordHash = await bcrypt.hash(password, 10);

  const sessionId = crypto.randomUUID();
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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

  // Execute inside transaction
  try {
    await repo.initializeAdmin({
      userId,
      employeeCode,
      name,
      email,
      passwordHash,
      sessionId,
      refreshToken,
      clientInfo: {
        deviceName: device,
        browser,
        operatingSystem: os,
        ipAddress: clientInfo.ipAddress
      },
      expiresAt
    });
  } catch (err) {
    if (err.message === 'System already initialized') {
      const error = new Error('System has already been initialized.');
      error.status = 409;
      throw error;
    }
    throw err;
  }

  // Generate JWT token
  const tokenPayload = {
    id: userId,
    email: email,
    role: 'ADMIN',
    departmentId: null,
    sessionId: sessionId
  };

  const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: userId,
      employee_code: employeeCode,
      name,
      email,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  };
};
