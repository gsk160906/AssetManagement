import { Router } from 'express';
import authRoutes from '../../modules/auth/auth.routes.js';
import dashboardRoutes from '../../modules/dashboard/dashboard.routes.js';
import assetRouter, { maintenanceRouter } from '../../modules/assets/assets.routes.js';
import allocationRoutes from '../../modules/allocation/allocation.routes.js';

const router = Router();

// Register feature module routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/assets', assetRouter);
router.use('/maintenance', maintenanceRouter);
router.use('/allocations', allocationRoutes);

export default router;
