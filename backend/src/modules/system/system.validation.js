import { z } from 'zod';

export const initializeSchema = {
  body: z.object({
    organizationName: z.string().trim().min(1, 'Organization name is required'),
    name: z.string().trim().min(1, 'Administrator full name is required'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
      .refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
      .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' })
      .refine((val) => /[^A-Za-z0-9]/.test(val), { message: 'Password must contain at least one special character' }),
    confirmPassword: z.string().min(1, 'Confirm password is required')
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
};
