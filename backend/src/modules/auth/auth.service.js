import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import * as authRepository from './auth.repository.js';
import { comparePassword } from '../../utils/password.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

export const login = async (email, password) => {
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

  // Generate JWT Token with id, email, role, and departmentId
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
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
