import { Router } from 'express';
import authRoutes from '../../modules/auth/auth.routes.js';
import dashboardRoutes from '../../modules/dashboard/dashboard.routes.js';

const router = Router();

// Register feature module routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
