import { Router } from 'express';
import * as controller from './audits.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createAuditSchema, verifyAssetSchema, bulkVerifySchema } from './audits.validation.js';

const router = Router();
router.use(authenticate);

// Priority path check
router.get('/:id/progress', controller.getAuditProgress);
router.get('/:id/report', controller.getAuditReport);
router.get('/:id/items', controller.getAuditItemsList);
router.get('/:id/logs', controller.getAuditLogs);

// Standard Rest Paths
router.get('/', controller.getAudits);
router.get('/:id', controller.getAuditById);

// Write actions guarded by Roles (Admin, Asset Manager, Auditor)
router.post('/', authorize('ADMIN', 'ASSET_MANAGER', 'AUDITOR'), validate(createAuditSchema), controller.createAudit);
router.patch('/:id/start', authorize('ADMIN', 'ASSET_MANAGER', 'AUDITOR'), controller.startAudit);
router.patch('/:id/cancel', authorize('ADMIN', 'ASSET_MANAGER', 'AUDITOR'), controller.cancelAudit);
router.patch('/:id/complete', authorize('ADMIN', 'ASSET_MANAGER', 'AUDITOR'), controller.completeAudit);
router.patch('/:id/assets/bulk', authorize('ADMIN', 'ASSET_MANAGER', 'AUDITOR'), validate(bulkVerifySchema), controller.bulkVerifyAssets);
router.patch('/:auditId/assets/:assetId', authorize('ADMIN', 'ASSET_MANAGER', 'AUDITOR'), validate(verifyAssetSchema), controller.verifyAsset);

export default router;
