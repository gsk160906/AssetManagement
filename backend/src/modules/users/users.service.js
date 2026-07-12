import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import * as repo from './users.repository.js';

export const listUsers = async (filters, pagination) => {
  return await repo.findUsers(filters, pagination);
};

export const createUser = async (data) => {
  const { employeeCode, email, password } = data;

  // 1. Verify email uniqueness
  const emailExists = await repo.getUserByEmail(email);
  if (emailExists) {
    const error = new Error('Email address is already in use.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify employee code uniqueness
  const codeExists = await repo.getUserByEmployeeCode(employeeCode);
  if (codeExists) {
    const error = new Error('Employee code is already in use.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  return await repo.createUser({
    id,
    ...data,
    passwordHash
  });
};

export const updateUser = async (id, data) => {
  const { email } = data;

  // Check email conflict
  if (email) {
    const emailUser = await repo.getUserByEmail(email);
    if (emailUser && emailUser.id !== id) {
      const error = new Error('Email address is already in use.');
      error.statusCode = 400;
      throw error;
    }
  }

  return await repo.updateUser(id, data);
};

export const deleteUser = async (id) => {
  return await repo.softDeleteUser(id);
};
