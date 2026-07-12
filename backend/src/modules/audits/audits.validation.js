import { z } from 'zod';

export const createAuditSchema = z.object({
  audit_name: z.string().min(3, 'Audit name must be at least 3 characters').max(150),
  description: z.string().max(1000).optional().nullable(),
  auditor_id: z.string().uuid('Invalid auditor user ID'),
  audit_type: z.enum(['full', 'department', 'location', 'random']).default('full'),
  start_date: z.string().date('Invalid start date format (YYYY-MM-DD)')
});

export const verifyAssetSchema = z.object({
  verification_status: z.enum(['verified', 'missing', 'damaged', 'relocated', 'not_found', 'pending']),
  actual_location: z.string().max(255).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable()
});

export const bulkVerifySchema = z.object({
  assets: z.array(
    z.object({
      id: z.string().uuid('Invalid asset ID'),
      status: z.enum(['verified', 'missing', 'damaged', 'relocated', 'not_found', 'pending']),
      actual_location: z.string().max(255).optional().nullable(),
      remarks: z.string().max(1000).optional().nullable()
    })
  ).min(1, 'At least one asset is required for bulk verification')
});
