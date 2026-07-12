import { z } from 'zod';

export const createUserSchema = {
  body: z.object({
    employeeCode: z.string().trim().min(2, 'Employee code must be at least 2 characters'),
    name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
      .refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
      .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' })
      .refine((val) => /[^A-Za-z0-9]/.test(val), { message: 'Password must contain at least one special character' }),
    role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']),
    departmentId: z.string().uuid().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional()
  })
};

export const updateUserSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']),
    departmentId: z.string().uuid().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE'])
  })
};
