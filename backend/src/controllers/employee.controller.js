const employeeService = require('../services/employee.service');
const employeeDocumentService = require('../services/employee-document.service');
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

async function listDocumentTemplates(req, res) {
  const templates = employeeDocumentService.getDocumentTemplates();
  return sendSuccess(res, { templates });
}

async function listDocuments(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  if (!employeeId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const documents = await employeeDocumentService.listEmployeeDocuments(req.companyId, employeeId);
  return sendSuccess(res, { documents });
}

async function generateDocument(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  if (!employeeId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const result = await employeeDocumentService.generateEmployeeDocument(
    req.companyId,
    employeeId,
    req.params.templateKey,
    req.user.id,
  );

  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  return res.status(200).send(result.buffer);
}

async function uploadDocument(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  if (!employeeId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const document = await employeeDocumentService.uploadEmployeeDocument(
    req.companyId,
    employeeId,
    req.body,
    req.user.id,
  );

  return sendSuccess(res, { document }, 201);
}

async function downloadDocument(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  const documentId = parseInt(req.params.documentId, 10);

  if (!employeeId || !documentId) {
    return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);
  }

  const result = await employeeDocumentService.getEmployeeDocument(
    req.companyId,
    employeeId,
    documentId,
  );

  res.setHeader('Content-Type', result.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
  return res.status(200).send(result.buffer);
}

async function updateDocument(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  const documentId = parseInt(req.params.documentId, 10);

  if (!employeeId || !documentId) {
    return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);
  }

  const document = await employeeDocumentService.updateEmployeeDocument(
    req.companyId,
    employeeId,
    documentId,
    req.body,
  );

  return sendSuccess(res, { document });
}

async function removeDocument(req, res) {
  const employeeId = parseInt(req.params.id, 10);
  const documentId = parseInt(req.params.documentId, 10);

  if (!employeeId || !documentId) {
    return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);
  }

  const result = await employeeDocumentService.deleteEmployeeDocument(
    req.companyId,
    employeeId,
    documentId,
  );

  return sendSuccess(res, result);
}

module.exports = {
  list,
  get,
  create,
  update,
  deactivate,
  restore,
  listDocumentTemplates,
  listDocuments,
  generateDocument,
  uploadDocument,
  downloadDocument,
  updateDocument,
  removeDocument,
};
