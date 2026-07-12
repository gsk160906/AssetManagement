import { Router } from 'express';
import * as assetsController from './assets.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import {
  createAssetSchema,
  updateAssetSchema,
  allocateAssetSchema,
  returnAssetSchema,
  transferAssetSchema,
  rejectTransferSchema,
  createMaintenanceSchema,
  assignTechnicianSchema,
  updateMaintenanceSchema
} from './assets.validation.js';

const assetRouter = Router();
const maintenanceRouter = Router();

// Apply JWT authentication to all routes
assetRouter.use(authenticate);
maintenanceRouter.use(authenticate);

// --- Bulk Operations (Precedence before /:id) ---
assetRouter.post('/bulk-import', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.bulkImport);
assetRouter.patch('/bulk-status', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.bulkUpdateStatus);
assetRouter.delete('/bulk-delete', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.bulkDelete);

// --- Warranties ---
assetRouter.get('/warranty/expiring', assetsController.getExpiringWarranties);
assetRouter.get('/warranty/expired', assetsController.getExpiredWarranties);

// --- Asset CRUD ---
assetRouter.get('/', assetsController.getAssets);
assetRouter.get('/:id', assetsController.getAssetById);
assetRouter.post('/', authorize('ADMIN', 'ASSET_MANAGER'), validate(createAssetSchema), assetsController.createAsset);
assetRouter.patch('/:id', authorize('ADMIN', 'ASSET_MANAGER'), validate(updateAssetSchema), assetsController.updateAsset);
assetRouter.delete('/:id', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.deleteAsset);
assetRouter.post('/:id/duplicate', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.duplicateAsset);
assetRouter.patch('/:id/archive', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.archiveAsset);

// --- Allocations ---
assetRouter.post('/:id/allocate', authorize('ADMIN', 'ASSET_MANAGER'), validate(allocateAssetSchema), assetsController.allocateAsset);
assetRouter.post('/:id/return', authorize('ADMIN', 'ASSET_MANAGER'), validate(returnAssetSchema), assetsController.returnAsset);
assetRouter.patch('/:id/extend', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.extendAllocation);
assetRouter.get('/:id/allocation-history', assetsController.getAllocationHistory);

// --- Transfers ---
assetRouter.post('/:id/transfer', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), validate(transferAssetSchema), assetsController.requestTransfer);
assetRouter.get('/:id/transfers', assetsController.getTransferHistory);

// --- Documents ---
assetRouter.post('/:id/documents', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.createDocument);
assetRouter.get('/:id/documents', assetsController.getDocuments);
assetRouter.delete('/documents/:id', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.deleteDocument);

// --- Timeline, QR, Maintenance list ---
assetRouter.get('/:id/timeline', assetsController.getAssetTimeline);
assetRouter.get('/:id/qrcode', assetsController.generateQRCode);
assetRouter.get('/:id/maintenance', assetsController.getMaintenanceHistory);

// --- Global Maintenance Router ---
maintenanceRouter.post('/', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'), validate(createMaintenanceSchema), assetsController.createMaintenance);
maintenanceRouter.patch('/:id', authorize('ADMIN', 'ASSET_MANAGER'), validate(updateMaintenanceSchema), assetsController.updateMaintenance);
maintenanceRouter.patch('/:id/assign', authorize('ADMIN', 'ASSET_MANAGER'), validate(assignTechnicianSchema), assetsController.assignTechnician);
maintenanceRouter.patch('/:id/resolve', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.resolveMaintenance);

// Approve, reject, complete transfers
assetRouter.patch('/transfers/:id/approve', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.approveTransfer);
assetRouter.patch('/transfers/:id/reject', authorize('ADMIN', 'ASSET_MANAGER'), validate(rejectTransferSchema), assetsController.rejectTransfer);
assetRouter.patch('/transfers/:id/complete', authorize('ADMIN', 'ASSET_MANAGER'), assetsController.completeTransfer);

export { maintenanceRouter };
export default assetRouter;
