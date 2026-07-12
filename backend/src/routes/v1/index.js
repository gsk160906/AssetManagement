import { Router } from 'express';
import authRoutes from '../../modules/auth/auth.routes.js';

const router = Router();

// Register feature module routes
router.use('/auth', authRoutes);

// Future route integrations will be registered here:
// router.use('/assets', assetRoutes);
// router.use('/bookings', bookingRoutes);

export default router;
