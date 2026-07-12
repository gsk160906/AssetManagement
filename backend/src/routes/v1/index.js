import { Router } from 'express';
import authRoutes from '../../modules/auth/auth.routes.js';
import dashboardRoutes from '../../modules/dashboard/dashboard.routes.js';
import assetRouter from '../../modules/assets/assets.routes.js';
import allocationRoutes from '../../modules/allocation/allocation.routes.js';
import maintenanceRoutes from '../../modules/maintenance/maintenance.routes.js';
import bookingRoutes from '../../modules/bookings/booking.routes.js';
import auditRoutes from '../../modules/audits/audits.routes.js';
import reportsRoutes from '../../modules/reports/reports.routes.js';

const router = Router();

// Register feature module routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/assets', assetRouter);
router.use('/maintenance', maintenanceRoutes);
router.use('/allocations', allocationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/audits', auditRoutes);
router.use('/reports', reportsRoutes);

export default router;




