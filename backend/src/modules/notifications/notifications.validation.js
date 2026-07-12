import { z } from 'zod';

export const queryNotificationsSchema = z.object({
  page: z.preprocess((val) => parseInt(val, 10) || 1, z.number().min(1)),
  limit: z.preprocess((val) => parseInt(val, 10) || 20, z.number().min(1).max(100)),
  category: z.enum(['ASSET', 'MAINTENANCE', 'BOOKING', 'AUDIT', 'REPORT', 'SYSTEM', 'SECURITY', 'TRANSFER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['READ', 'UNREAD']).optional()
});

export const updatePreferencesSchema = z.object({
  maintenance_enabled: z.boolean().optional(),
  booking_enabled: z.boolean().optional(),
  audit_enabled: z.boolean().optional(),
  report_enabled: z.boolean().optional(),
  asset_enabled: z.boolean().optional(),
  system_enabled: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
  browser_enabled: z.boolean().optional()
});
