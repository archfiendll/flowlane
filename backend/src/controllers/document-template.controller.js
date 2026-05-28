const documentTemplateService = require('../services/document-template.service');
const { sendSuccess, sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function list(req, res) {
  const result = await documentTemplateService.listDocumentTemplates(req.companyId);
  return sendSuccess(res, result);
}

async function get(req, res) {
  const templateId = parseInt(req.params.id, 10);
  if (!templateId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const template = await documentTemplateService.getDocumentTemplate(req.companyId, templateId);
  return sendSuccess(res, { template });
}

async function create(req, res) {
  const template = await documentTemplateService.createDocumentTemplate(req.companyId, req.user.id, req.body);
  return sendSuccess(res, { template }, 201);
}

async function update(req, res) {
  const templateId = parseInt(req.params.id, 10);
  if (!templateId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const template = await documentTemplateService.updateDocumentTemplate(
    req.companyId,
    templateId,
    req.user.id,
    req.body,
  );
  return sendSuccess(res, { template });
}

async function download(req, res) {
  const templateId = parseInt(req.params.id, 10);
  if (!templateId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  const result = await documentTemplateService.downloadDocumentTemplate(req.companyId, templateId);
  res.setHeader('Content-Type', result.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
  return res.status(200).send(result.buffer);
}

async function remove(req, res) {
  const templateId = parseInt(req.params.id, 10);
  if (!templateId) return sendError(res, 'Invalid ID', errorCodes.VALIDATION_001, 400);

  await documentTemplateService.deleteDocumentTemplate(req.companyId, templateId);
  return sendSuccess(res, { message: 'Template deleted' });
}

module.exports = {
  list,
  get,
  create,
  update,
  download,
  remove,
};
