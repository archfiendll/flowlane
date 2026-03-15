'use strict';

const invitationService = require('../services/invitation.service');
const { sendSuccess, sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function invite(req, res) {
  const { email, role } = req.body;

  if (!email) {
    return sendError(res, 'Email is required', errorCodes.VALIDATION_001, 400);
  }

  const invitation = await invitationService.createInvitation({
    companyId: req.companyId,
    email,
    role,
  });

  return sendSuccess(res, { invitation }, 201);
}

async function accept(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return sendError(res, 'Token and password are required', errorCodes.VALIDATION_001, 400);
  }

  const user = await invitationService.acceptInvitation({ token, password });
  return sendSuccess(res, { user }, 201);
}
async function getByToken(req, res) {
  const { token } = req.query;
  if (!token) return sendError(res, 'Token is required', errorCodes.VALIDATION_001, 400);

  const invitation = await invitationService.getInvitationByToken(token);
  return sendSuccess(res, { invitation });
}

module.exports = { invite, accept, getByToken };

