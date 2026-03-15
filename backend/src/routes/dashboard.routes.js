'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const dashboardController = require('../controllers/dashboard.controller');

const router = Router();

router.use(requireAuth, requireTenant);
router.get('/stats', asyncHandler(dashboardController.getStats));

module.exports = router;