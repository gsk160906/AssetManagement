import { Router } from 'express';
import * as controller from './reports.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { exportReportSchema } from './reports.validation.js';

const router = Router();
router.use(authenticate);

// Priority path check
router.get('/history', controller.getReportHistory);
router.get('/assets', controller.getAssetReport);
router.get('/maintenance', controller.getMaintenanceReport);
router.get('/audits', controller.getAuditReport);
router.get('/bookings', controller.getBookingReport);
router.get('/expenses', controller.getExpenseReport);

// Actions
router.get('/', controller.getAvailableReports);
router.post('/export', validate(exportReportSchema), controller.exportReport);

export default router;
