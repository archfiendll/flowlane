'use strict';

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const employeeController = require('../controllers/employee.controller');

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', requireRole('admin', 'manager'), asyncHandler(employeeController.list));
router.post('/', requireRole('admin'), asyncHandler(employeeController.create));
router.get('/:id', requireRole('admin', 'manager'), asyncHandler(employeeController.get));
router.put('/:id', requireRole('admin'), asyncHandler(employeeController.update));
router.delete('/:id', requireRole('admin'), asyncHandler(employeeController.deactivate));

module.exports = router;