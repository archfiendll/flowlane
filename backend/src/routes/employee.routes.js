'use strict';

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const employeeController = require('../controllers/employee.controller');

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/documents/templates', requireRole('admin', 'manager'), asyncHandler(employeeController.listDocumentTemplates));
router.get('/', requireRole('admin', 'manager'), asyncHandler(employeeController.list));
router.post('/', requireRole('admin'), asyncHandler(employeeController.create));
router.get('/:id', requireRole('admin', 'manager'), asyncHandler(employeeController.get));
router.get('/:id/documents/:templateKey', requireRole('admin'), asyncHandler(employeeController.generateDocument));
router.put('/:id', requireRole('admin'), asyncHandler(employeeController.update));
router.delete('/:id', requireRole('admin'), asyncHandler(employeeController.deactivate));
router.post('/:id/restore', requireRole('admin'), asyncHandler(employeeController.restore));

module.exports = router;
