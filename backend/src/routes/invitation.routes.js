'use strict';

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const invitationController = require('../controllers/invitation.controller');

const router = Router();

router.get(
  '/',
  requireAuth,
  requireTenant,
  requireRole('admin', 'manager'),
  asyncHandler(invitationController.list),
);

// Send invite — admin only, requires auth + tenant
router.post(
  '/',
  requireAuth,
  requireTenant,
  requireRole('admin', 'manager'),
  asyncHandler(invitationController.invite),
);

// Accept invite — public route, no auth needed
// Accept invite — public route, no auth needed
router.get('/accept', asyncHandler(invitationController.getByToken));
router.post('/accept', asyncHandler(invitationController.accept));
router.post(
  '/:id/revoke',
  requireAuth,
  requireTenant,
  requireRole('admin', 'manager'),
  asyncHandler(invitationController.revoke),
);

module.exports = router;
