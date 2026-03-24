const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const aiController = require('../controllers/ai.controller');

const router = Router();

router.use(requireAuth, requireTenant);
router.post('/chat', asyncHandler(aiController.chat));

module.exports = router;
