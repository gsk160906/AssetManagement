import { z } from 'zod';

const assetConditionEnum = z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']);
const assetStatusEnum = z.enum(['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED']);
const maintenancePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const maintenanceStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED']);

const assetBaseSchema = z.object({
  asset_tag: z.string().min(3).max(100),
  name: z.string().min(3).max(100),
  category_id: z.string().uuid(),
  serial_number: z.string().min(3).max(100),
  manufacturer: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  acquisition_date: z.coerce.date(),
  acquisition_cost: z.coerce.number().nonnegative(),
  warranty_expiry_date: z.coerce.date().nullable().optional(),
  condition: assetConditionEnum.default('EXCELLENT'),
  status: assetStatusEnum.default('AVAILABLE'),
  current_department_id: z.string().uuid().nullable().optional(),
  current_location: z.string().max(255).nullable().optional(),
  is_shared_bookable: z.boolean().default(false),
  image_url: z.string().max(255).nullable().optional()
});

export const createAssetSchema = assetBaseSchema.refine(data => {
  if (data.warranty_expiry_date && data.acquisition_date) {
    return new Date(data.warranty_expiry_date) >= new Date(data.acquisition_date);
  }
  return true;
}, {
  message: "Warranty expiry date must be on or after the acquisition date",
  path: ["warranty_expiry_date"]
});

export const updateAssetSchema = assetBaseSchema.partial().refine(data => {
  if (data.warranty_expiry_date && data.acquisition_date) {
    return new Date(data.warranty_expiry_date) >= new Date(data.acquisition_date);
  }
  return true;
}, {
  message: "Warranty expiry date must be on or after the acquisition date",
  path: ["warranty_expiry_date"]
});

export const allocateAssetSchema = z.object({
  employee_id: z.string().uuid(),
  allocated_date: z.coerce.date().optional(),
  expected_return_date: z.coerce.date().nullable().optional(),
  condition_before: assetConditionEnum.default('GOOD'),
  notes: z.string().max(500).nullable().optional()
});

export const returnAssetSchema = z.object({
  condition_after: assetConditionEnum,
  notes: z.string().max(500).nullable().optional()
});

export const transferAssetSchema = z.object({
  to_employee_id: z.string().uuid(),
  remarks: z.string().max(500).nullable().optional()
});

export const rejectTransferSchema = z.object({
  remarks: z.string().min(1, "Remarks are required to reject a transfer").max(500)
});

export const createMaintenanceSchema = z.object({
  description: z.string().min(3).max(1000),
  priority: maintenancePriorityEnum.default('MEDIUM')
});

export const assignTechnicianSchema = z.object({
  assigned_technician_id: z.string().uuid()
});

export const updateMaintenanceSchema = z.object({
  status: maintenanceStatusEnum.optional(),
  actual_cost: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(500).nullable().optional()
});
