'use strict';

const { sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

function requireTenant(req, res, next) {
  if (!req.user || !req.user.companyId) {
    return sendError(res, 'No company associated with this account', errorCodes.AUTH_004, 403);
  }
  req.companyId = req.user.companyId;
  return next();
}

module.exports = { requireTenant };