import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './profile.controller.js';
import { uploadAvatarMiddleware } from './upload.middleware.js';
import { 
  updateProfileSchema, 
  changePasswordSchema, 
  updatePreferencesSchema 
} from './profile.validation.js';

const router = Router();

// Apply JWT authentication to all profile routes
router.use(authenticate);

// Profile Management
router.get('/', controller.getProfile);
router.put('/', validate(updateProfileSchema), controller.updateProfile);

// Avatar Actions
router.post('/avatar', uploadAvatarMiddleware, controller.uploadAvatar);
router.delete('/avatar', controller.deleteAvatar);

// Password Change
router.patch('/change-password', validate(changePasswordSchema), controller.changePassword);

// Preferences Management
router.get('/preferences', controller.getPreferences);
router.patch('/preferences', validate(updatePreferencesSchema), controller.updatePreferences);

// Active Sessions Management
router.get('/sessions', controller.getSessions);
router.delete('/sessions/current', controller.logoutCurrentSession);
router.delete('/sessions', controller.logoutAllSessions);

export default router;
