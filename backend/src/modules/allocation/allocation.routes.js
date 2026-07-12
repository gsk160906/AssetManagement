import { Router } from 'express';
import * as controller from './allocation.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import {
  createAllocationSchema,
  returnAllocationSchema,
  transferAllocationSchema
} from './allocation.validation.js';

const router = Router();

// Apply JWT authentication to all routes
router.use(authenticate);

// Allocation CRUD / Operations
router.get('/', authorize('ADMIN', 'ASSET_MANAGER'), controller.getAllocations);
router.post('/', authorize('ADMIN', 'ASSET_MANAGER'), validate(createAllocationSchema), controller.allocateAsset);
router.patch('/:id/return', authorize('ADMIN', 'ASSET_MANAGER'), validate(returnAllocationSchema), controller.returnAsset);
router.post('/transfer', authorize('ADMIN', 'ASSET_MANAGER'), validate(transferAllocationSchema), controller.transferAsset);

// History & Assignments
router.get('/history/:assetId', authorize('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE'), controller.getAssetHistory);
router.get('/employee/:employeeId', authorize('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE'), controller.getEmployeeAssets);

export default router;
