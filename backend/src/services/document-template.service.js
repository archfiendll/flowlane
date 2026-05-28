const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const prisma = require('../config/prisma');
const documentStorageService = require('./document-storage.service');
const employeeDocumentService = require('./employee-document.service');

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizeFilenamePart(value) {
  return String(value || 'template')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildStoredFileName(key, fileName) {
  const extension = path.extname(fileName) || '.docx';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${sanitizeFilenamePart(key)}-${timestamp}${extension}`;
}

function normalizeTemplateMetadata(data = {}) {
  const name = String(data.name || '').trim();
  const key = slugify(data.key || name);
  const category = String(data.category || '').trim() || null;
  const description = String(data.description || '').trim() || null;

  if (!name) {
    const err = new Error('Template name is required');
    err.status = 400;
    throw err;
  }

  if (!key) {
    const err = new Error('Template key is required');
    err.status = 400;
    throw err;
  }

  return { name, key, category, description };
}

function validateDocxTemplateBuffer(buffer, fileName, mimeType) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension !== '.docx') {
    const err = new Error('Only .docx template files are supported');
    err.status = 400;
    throw err;
  }

  if (
    mimeType
    && mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    && mimeType !== 'application/octet-stream'
    && mimeType !== 'application/zip'
  ) {
    const err = new Error('Unsupported template file type');
    err.status = 400;
    throw err;
  }

  try {
    const zip = new PizZip(buffer);
    const documentXml = zip.file('word/document.xml');

    if (!documentXml) {
      const err = new Error('Uploaded file is not a valid DOCX template');
      err.status = 400;
      throw err;
    }

    // Constructor validation catches malformed zip/docx structures early.
    // We intentionally do not render here because placeholders may reference
    // valid runtime fields that only exist during employee generation.
    // eslint-disable-next-line no-new
    new Docxtemplater(zip, {
      delimiters: { start: '{{', end: '}}' },
      paragraphLoop: true,
      linebreaks: true,
    });
  } catch (err) {
    if (err.status) throw err;

    const nextError = new Error('Uploaded file is not a valid DOCX template');
    nextError.status = 400;
    throw nextError;
  }
}

function serializeTemplate(template) {
  return {
    id: template.id,
    name: template.name,
    key: template.key,
    category: template.category,
    description: template.description,
    fileName: template.fileName,
    mimeType: template.mimeType,
    storageProvider: template.storageProvider,
    createdById: template.createdById,
    updatedById: template.updatedById,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

async function listDocumentTemplates(companyId) {
  const uploadedTemplates = await prisma.documentTemplate.findMany({
    where: { companyId },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
  });

  return {
    builtInTemplates: employeeDocumentService.getDocumentTemplates(),
    uploadedTemplates: uploadedTemplates.map(serializeTemplate),
  };
}

async function createDocumentTemplate(companyId, userId, data) {
  const metadata = normalizeTemplateMetadata(data);
  const fileName = String(data.fileName || '').trim();
  const mimeType = String(data.mimeType || '').trim() || 'application/octet-stream';
  const contentBase64 = String(data.contentBase64 || '').trim();

  if (!fileName || !contentBase64) {
    const err = new Error('Template file and content are required');
    err.status = 400;
    throw err;
  }

  const duplicate = await prisma.documentTemplate.findFirst({
    where: { companyId, key: metadata.key },
    select: { id: true },
  });

  if (duplicate) {
    const err = new Error('A template with this key already exists');
    err.status = 409;
    throw err;
  }

  if (employeeDocumentService.getDocumentTemplates().some((template) => template.key === metadata.key)) {
    const err = new Error('This key is already reserved by a built-in template');
    err.status = 409;
    throw err;
  }

  const buffer = Buffer.from(contentBase64, 'base64');
  if (!buffer.length) {
    const err = new Error('Uploaded template is empty');
    err.status = 400;
    throw err;
  }

  validateDocxTemplateBuffer(buffer, fileName, mimeType);

  const storedFile = await documentStorageService.saveDocument(
    buffer,
    `document-templates/${companyId}/${buildStoredFileName(metadata.key, fileName)}`,
  );

  const template = await prisma.documentTemplate.create({
    data: {
      companyId,
      createdById: userId,
      updatedById: userId,
      ...metadata,
      fileName,
      mimeType,
      storageProvider: storedFile.storageProvider,
      storageKey: storedFile.storageKey,
    },
  });

  return serializeTemplate(template);
}

async function getDocumentTemplate(companyId, templateId) {
  const template = await prisma.documentTemplate.findFirst({
    where: { id: templateId, companyId },
  });

  if (!template) {
    const err = new Error('Template not found');
    err.status = 404;
    throw err;
  }

  return serializeTemplate(template);
}

async function updateDocumentTemplate(companyId, templateId, userId, data) {
  const existing = await prisma.documentTemplate.findFirst({
    where: { id: templateId, companyId },
  });

  if (!existing) {
    const err = new Error('Template not found');
    err.status = 404;
    throw err;
  }

  const metadata = normalizeTemplateMetadata(data);
  const duplicate = await prisma.documentTemplate.findFirst({
    where: {
      companyId,
      key: metadata.key,
      NOT: { id: templateId },
    },
    select: { id: true },
  });

  if (duplicate) {
    const err = new Error('A template with this key already exists');
    err.status = 409;
    throw err;
  }

  if (employeeDocumentService.getDocumentTemplates().some((template) => template.key === metadata.key)) {
    const err = new Error('This key is already reserved by a built-in template');
    err.status = 409;
    throw err;
  }

  const template = await prisma.documentTemplate.update({
    where: { id: templateId },
    data: {
      ...metadata,
      updatedById: userId,
    },
  });

  return serializeTemplate(template);
}

async function downloadDocumentTemplate(companyId, templateId) {
  const template = await prisma.documentTemplate.findFirst({
    where: { id: templateId, companyId },
  });

  if (!template) {
    const err = new Error('Template not found');
    err.status = 404;
    throw err;
  }

  return {
    ...serializeTemplate(template),
    buffer: await documentStorageService.readDocument(template.storageProvider, template.storageKey),
  };
}

async function deleteDocumentTemplate(companyId, templateId) {
  const template = await prisma.documentTemplate.findFirst({
    where: { id: templateId, companyId },
  });

  if (!template) {
    const err = new Error('Template not found');
    err.status = 404;
    throw err;
  }

  await documentStorageService.removeDocument(template.storageProvider, template.storageKey);
  await prisma.documentTemplate.delete({
    where: { id: templateId },
  });
}

module.exports = {
  listDocumentTemplates,
  createDocumentTemplate,
  getDocumentTemplate,
  updateDocumentTemplate,
  downloadDocumentTemplate,
  deleteDocumentTemplate,
};
