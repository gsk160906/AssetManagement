import { Router } from 'express';
import * as controller from './department.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { createDepartmentSchema, updateDepartmentSchema } from './department.validation.js';

const router = Router();
router.use(authenticate);

// Special paths
router.get('/tree', controller.getDepartmentTree);
router.get('/stats', controller.getDepartmentStats);

// Parameter paths
router.get('/:id', controller.getDepartmentById);
router.get('/:id/employees', controller.getDepartmentEmployees);
router.get('/:id/assets', controller.getDepartmentAssets);

// General CRUD
router.get('/', controller.getDepartments);
router.post('/', validate(createDepartmentSchema), controller.createDepartment);
router.patch('/:id', validate(updateDepartmentSchema), controller.updateDepartment);
router.delete('/:id', controller.deleteDepartment);

export default router;
