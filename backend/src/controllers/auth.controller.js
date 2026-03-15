const { registerSchema, loginSchema } = require('../validators/auth.validators');
const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'Validation failed', errorCodes.VALIDATION_001, 400);
  }
  const { user, company } = await authService.register(parsed.data);
  return sendSuccess(res, { user, company }, 201);
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'Validation failed', errorCodes.VALIDATION_001, 400);
  }
  const result = await authService.login(parsed.data);
  return sendSuccess(res, result);
}

async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;
  const result = await authService.refresh(token);
  return sendSuccess(res, result);
}

async function logout(req, res) {
  await authService.logout(req.user.id);
  return sendSuccess(res, { message: 'Logged out' });
}

module.exports = { register, login, refreshToken, logout };