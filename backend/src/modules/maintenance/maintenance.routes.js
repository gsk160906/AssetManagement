import { Router } from 'express';
import * as controller from './maintenance.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  updateStatusSchema
} from './maintenance.validation.js';

const router = Router();
router.use(authenticate);

// Statistics (admin/manager only)
router.get('/stats', authorize('ADMIN', 'ASSET_MANAGER'), controller.getMaintenanceStats);

// List & detail
router.get('/',    authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'), controller.getMaintenances);
router.get('/:id', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'), controller.getMaintenanceById);

// Create
router.post('/', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'), validate(createMaintenanceSchema), controller.createMaintenance);

// Update fields (admin/manager can edit technician; others limited)
router.patch('/:id',        authorize('ADMIN', 'ASSET_MANAGER'), validate(updateMaintenanceSchema), controller.updateMaintenance);
router.patch('/:id/status', authorize('ADMIN', 'ASSET_MANAGER'), validate(updateStatusSchema),      controller.updateStatus);

// Soft delete — PENDING only
router.delete('/:id', authorize('ADMIN', 'ASSET_MANAGER'), controller.deleteMaintenance);

export default router;
