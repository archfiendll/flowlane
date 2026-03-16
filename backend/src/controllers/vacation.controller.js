'use strict';

const vacationService = require('../services/vacation.service');
const { sendError, sendSuccess } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function list(req, res) {
  const requests = await vacationService.listVacationRequests({
    companyId: req.companyId,
    role: req.user.role,
    userId: req.user.id,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId, 10) : null,
  });

  return sendSuccess(res, { requests });
}

async function create(req, res) {
  const { type, startDate, endDate } = req.body;
  if (!type || !startDate || !endDate) {
    return sendError(res, 'Type, start date, and end date are required', errorCodes.VALIDATION_001, 400);
  }

  const request = await vacationService.createVacationRequest({
    companyId: req.companyId,
    userId: req.user.id,
    ...req.body,
  });

  return sendSuccess(res, { request }, 201);
}

async function approve(req, res) {
  const requestId = parseInt(req.params.id, 10);
  if (!requestId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);
  const request = await vacationService.updateVacationStatus({
    companyId: req.companyId,
    requestId,
    status: 'APPROVED',
    approverId: req.user.id,
  });
  return sendSuccess(res, { request });
}

async function reject(req, res) {
  const requestId = parseInt(req.params.id, 10);
  if (!requestId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);
  const request = await vacationService.updateVacationStatus({
    companyId: req.companyId,
    requestId,
    status: 'REJECTED',
    approverId: req.user.id,
  });
  return sendSuccess(res, { request });
}

module.exports = { list, create, approve, reject };
