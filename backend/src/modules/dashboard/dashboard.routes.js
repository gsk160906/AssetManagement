import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { dashboardQuerySchema } from './dashboard.validation.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

// Apply JWT authentication to all sub-endpoints
router.use(authenticate);

const validateQueries = validate({ query: dashboardQuerySchema });

router.get('/overview', dashboardController.getOverview);
router.get('/charts', dashboardController.getCharts);
router.get('/activities', validateQueries, dashboardController.getActivities);
router.get('/bookings', validateQueries, dashboardController.getBookings);
router.get('/maintenance', dashboardController.getMaintenance);
router.get('/notifications', validateQueries, dashboardController.getNotifications);

export default router;
