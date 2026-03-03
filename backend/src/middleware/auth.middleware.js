const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../config/jwt');
const { sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return sendError(res, 'Missing or invalid Authorization header', errorCodes.AUTH_003, 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return sendError(
        res,
        isExpired ? 'Token expired' : 'Invalid token',
        isExpired ? errorCodes.AUTH_002 : errorCodes.AUTH_003,
        401,
      );
    }

    const userId = Number(payload.sub);
    if (!userId) {
      return sendError(res, 'Invalid token payload', errorCodes.AUTH_003, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return sendError(res, 'User not found', errorCodes.AUTH_003, 401);
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 'Unauthorized', errorCodes.AUTH_003, 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden', errorCodes.AUTH_004, 403);
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };