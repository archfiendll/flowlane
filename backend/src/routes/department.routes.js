'use strict';

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const departmentController = require('../controllers/department.controller');

const router = Router();

router.use(requireAuth, requireTenant);
router.get('/', requireRole('admin', 'manager'), asyncHandler(departmentController.list));
router.post('/', requireRole('admin'), asyncHandler(departmentController.create));
router.put('/:id', requireRole('admin'), asyncHandler(departmentController.update));
router.delete('/:id', requireRole('admin'), asyncHandler(departmentController.remove));

module.exports = router;
