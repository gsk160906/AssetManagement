import { z } from 'zod';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const statusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']);

export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  priority: priorityEnum.default('MEDIUM'),
  estimatedCost: z.number().min(0, 'Estimated cost cannot be negative').optional().default(0)
});

export const updateMaintenanceSchema = z.object({
  description: z.string().min(10).max(1000).optional(),
  priority: priorityEnum.optional(),
  estimatedCost: z.number().min(0).optional(),
  assignedTechnicianId: z.string().uuid('Invalid technician ID').nullable().optional()
});

export const assignTechnicianSchema = z.object({
  technicianId: z.string().uuid('Invalid technician ID')
});

export const updateStatusSchema = z.object({
  status: statusEnum,
  actualCost: z.number().min(0).optional(),
  notes: z.string().max(500).optional()
});
