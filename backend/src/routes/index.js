import { Router } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';
import { successResponse } from '../utils/response.js';
import v1Router from './v1/index.js';

const router = Router();

// Base health endpoint
router.get('/', (req, res) => {
  successResponse(res, MESSAGES.SERVER_RUNNING, {}, HTTP_STATUS.OK);
});

// Detailed health-check endpoint
router.get('/health', (req, res) => {
  successResponse(res, 'System Health Status', {
    status: 'ok',
    database: 'connected',
    server: 'running',
  }, HTTP_STATUS.OK);
});

// Versioned APIs mounting
router.use('/api/v1', v1Router);

export default router;
