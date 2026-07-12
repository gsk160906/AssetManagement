import { Router } from 'express';
import * as controller from './notifications.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { queryNotificationsSchema, updatePreferencesSchema } from './notifications.validation.js';

const router = Router();
router.use(authenticate);

// Special routes
router.get('/count', controller.getNotificationCount);
router.get('/preferences', controller.getPreferences);
router.patch('/preferences', validate(updatePreferencesSchema), controller.updatePreferences);
router.patch('/read-all', controller.markAllRead);
router.delete('/read', controller.softDeleteRead);

// CRUD
router.get('/', validate({ query: queryNotificationsSchema }), controller.getNotifications);
router.get('/:id', controller.getNotificationById);
router.patch('/:id/read', controller.markRead);
router.patch('/:id/unread', controller.markUnread);
router.delete('/:id', controller.softDelete);

export default router;
