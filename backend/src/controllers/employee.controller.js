'use strict';

const employeeService = require('../services/employee.service');
const { sendSuccess, sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function list(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const {
    status,
    departmentId,
    archived,
    q,
    sortBy,
    sortOrder,
  } = req.query;

  const result = await employeeService.listEmployees(req.companyId, {
    page,
    limit,
    status,
    departmentId: departmentId ? parseInt(departmentId, 10) : null,
    archived,
    q,
    sortBy,
    sortOrder,
  });
  return sendSuccess(res, result);
}

async function get(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  if (!employeeId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const employee = await employeeService.getEmployee(req.companyId, employeeId);
  return sendSuccess(res, { employee });
}

async function create(req, res) {
  const employee = await employeeService.createEmployee(req.companyId, req.body);
  return sendSuccess(res, { employee }, 201);
}

async function update(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  if (!employeeId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const employee = await employeeService.updateEmployee(req.companyId, employeeId, req.body);
  return sendSuccess(res, { employee });
}

async function deactivate(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  if (!employeeId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const result = await employeeService.deactivateEmployee(req.companyId, employeeId);
  return sendSuccess(res, result);
}

async function restore(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  if (!employeeId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const result = await employeeService.restoreEmployee(req.companyId, employeeId);
  return sendSuccess(res, result);
}

module.exports = { list, get, create, update, deactivate, restore };
