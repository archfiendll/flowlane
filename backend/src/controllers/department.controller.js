'use strict';

const departmentService = require('../services/department.service');
const { sendError, sendSuccess } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function list(req, res) {
  const departments = await departmentService.listDepartments(req.companyId);
  return sendSuccess(res, { departments });
}

async function create(req, res) {
  if (!req.body.name?.trim()) {
    return sendError(res, 'Department name is required', errorCodes.VALIDATION_001, 400);
  }

  const department = await departmentService.createDepartment(req.companyId, req.body);
  return sendSuccess(res, { department }, 201);
}

async function update(req, res) {
  const departmentId = parseInt(req.params.id, 10);
  if (!departmentId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);
  if (!req.body.name?.trim()) {
    return sendError(res, 'Department name is required', errorCodes.VALIDATION_001, 400);
  }

  const department = await departmentService.updateDepartment(req.companyId, departmentId, req.body);
  return sendSuccess(res, { department });
}

async function remove(req, res) {
  const departmentId = parseInt(req.params.id, 10);
  if (!departmentId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const result = await departmentService.deleteDepartment(req.companyId, departmentId);
  return sendSuccess(res, result);
}

module.exports = { list, create, update, remove };
