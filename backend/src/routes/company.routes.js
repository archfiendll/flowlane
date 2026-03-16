'use strict';

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const companyController = require('../controllers/company.controller');

const router = Router();

router.get('/me', requireAuth, requireTenant, asyncHandler(companyController.getMine));
router.put(
  '/me',
  requireAuth,
  requireTenant,
  requireRole('admin', 'manager'),
  asyncHandler(companyController.updateMine),
);

module.exports = router;
