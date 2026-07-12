import { Router } from 'express';
import * as controller from './booking.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createBookingSchema, updateBookingSchema } from './booking.validation.js';

const router = Router();
router.use(authenticate);

// Priority paths first
router.get('/my', controller.getMyBookings);
router.get('/stats', authorize('ADMIN', 'ASSET_MANAGER'), controller.getBookingStats);
router.get('/calendar', controller.getCalendarEvents);
router.get('/available-resources', controller.getAvailableResources);

// Standard REST paths
router.get('/', controller.getBookings);
router.get('/:id', controller.getBookingById);
router.post('/', validate(createBookingSchema), controller.createBooking);
router.patch('/:id', validate(updateBookingSchema), controller.updateBooking);
router.delete('/:id', controller.cancelBooking);

export default router;
