const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { register, login, refreshToken, logout } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(async (req, res) => sendSuccess(res, req.user)));
router.post('/refresh', asyncHandler(refreshToken));
router.post('/logout', requireAuth, asyncHandler(logout));

module.exports = router;