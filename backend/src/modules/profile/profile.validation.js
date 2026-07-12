import { z } from 'zod';
import { THEMES } from './profile.constants.js';

export const updateProfileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(100, 'First name must be under 100 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(100, 'Last name must be under 100 characters'),
  phone_number: z.string().max(20).nullable().optional(),
  designation: z.string().max(100).nullable().optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').nullable().optional().transform(val => {
    if (!val) return val;
    // Basic sanitization to strip html tags
    return val.replace(/<[^>]*>/g, '');
  }),
  timezone: z.string().max(100).optional(),
  language: z.string().max(50).optional(),
  theme: z.nativeEnum(THEMES).optional(),
  date_format: z.string().max(50).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters long')
    .refine(
      (val) => /[A-Z]/.test(val),
      { message: 'New password must contain at least one uppercase letter' }
    )
    .refine(
      (val) => /[a-z]/.test(val),
      { message: 'New password must contain at least one lowercase letter' }
    )
    .refine(
      (val) => /[0-9]/.test(val),
      { message: 'New password must contain at least one number' }
    )
    .refine(
      (val) => /[^A-Za-z0-9]/.test(val),
      { message: 'New password must contain at least one special character' }
    )
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password cannot match the current password',
  path: ['newPassword']
});

export const updatePreferencesSchema = z.object({
  theme: z.nativeEnum(THEMES).optional(),
  default_dashboard: z.string().max(50).optional(),
  default_page_size: z.number().int().min(1).max(100).optional(),
  email_notifications: z.boolean().optional(),
  browser_notifications: z.boolean().optional(),
  maintenance_notifications: z.boolean().optional(),
  booking_notifications: z.boolean().optional(),
  audit_notifications: z.boolean().optional(),
  report_notifications: z.boolean().optional(),
  system_notifications: z.boolean().optional(),
  compact_mode: z.boolean().optional()
});
