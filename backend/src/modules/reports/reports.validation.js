import { z } from 'zod';

export const exportReportSchema = z.object({
  type: z.enum(['ASSET_REPORT', 'MAINTENANCE_REPORT', 'AUDIT_REPORT', 'BOOKING_REPORT', 'EXPENSE_REPORT']),
  format: z.enum(['CSV', 'PDF']),
  filters: z.object({
    status: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    from_date: z.string().optional().nullable(),
    to_date: z.string().optional().nullable(),
    priority: z.string().optional().nullable()
  }).optional()
});
