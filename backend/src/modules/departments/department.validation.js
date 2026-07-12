import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(100),
  parent_id: z.string().uuid().optional().nullable(),
  manager_id: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(100).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  manager_id: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});
