const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const documentTemplateController = require('../controllers/document-template.controller');

const router = Router();

router.use(requireAuth, requireTenant, requireRole('admin'));

router.get('/', asyncHandler(documentTemplateController.list));
router.post('/', asyncHandler(documentTemplateController.create));
router.get('/:id', asyncHandler(documentTemplateController.get));
router.get('/:id/download', asyncHandler(documentTemplateController.download));
router.put('/:id', asyncHandler(documentTemplateController.update));
router.delete('/:id', asyncHandler(documentTemplateController.remove));

module.exports = router;
