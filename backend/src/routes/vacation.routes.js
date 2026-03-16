'use strict';

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const vacationController = require('../controllers/vacation.controller');

const router = Router();

router.use(requireAuth, requireTenant);
router.get('/', asyncHandler(vacationController.list));
router.post('/', asyncHandler(vacationController.create));
router.post('/:id/approve', requireRole('admin', 'manager'), asyncHandler(vacationController.approve));
router.post('/:id/reject', requireRole('admin', 'manager'), asyncHandler(vacationController.reject));

module.exports = router;
