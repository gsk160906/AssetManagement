import { Router } from 'express';
import * as systemController from './system.controller.js';
import { initializeSchema } from './system.validation.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();

router.get('/setup-status', systemController.getSetupStatus);
router.post('/initialize', validate(initializeSchema), systemController.initializeSystem);

export default router;
