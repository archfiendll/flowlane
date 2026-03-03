const express = require('express');

const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Admin-only list users
router.get('/', requireAuth, requireRole('admin'), userController.listUsers);

module.exports = router;