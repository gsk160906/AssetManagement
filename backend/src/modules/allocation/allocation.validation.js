import { z } from 'zod';

const assetConditionEnum = z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']);

export const createAllocationSchema = z.object({
  assetId: z.string().uuid(),
  employeeId: z.string().uuid(),
  expectedReturnDate: z.string().datetime().or(z.string().date()).nullable().optional(),
  notes: z.string().max(500).nullable().optional()
});

export const returnAllocationSchema = z.object({
  conditionAfter: assetConditionEnum,
  notes: z.string().max(500).nullable().optional()
});

export const transferAllocationSchema = z.object({
  assetId: z.string().uuid(),
  newEmployeeId: z.string().uuid(),
  notes: z.string().max(500).nullable().optional()
});
