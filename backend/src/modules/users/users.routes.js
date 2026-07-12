import { Router } from 'express';
import * as userController from './users.controller.js';
import { createUserSchema, updateUserSchema } from './users.validation.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

const router = Router();

// Restrict all user management endpoints to Authenticated users
router.use(authenticate);

// Directory lookup is accessible to all authenticated staff
router.get('/', userController.getUsers);

// Mutating endpoints are strictly restricted to Administrators only
router.post('/', authorize('ADMIN'), validate(createUserSchema), userController.createUser);
router.put('/:id', authorize('ADMIN'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

export default router;
