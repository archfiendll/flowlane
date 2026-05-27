const fs = require('fs');
const path = require('path');

const LOCAL_STORAGE_PROVIDER = 'local';
const LOCAL_STORAGE_ROOT = path.join(__dirname, '../../storage');

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function normalizeStorageKey(storageKey) {
  return String(storageKey || '')
    .replace(/^\/+/, '')
    .replace(/\\/g, '/');
}

function resolveLocalPath(storageKey) {
  const normalizedKey = normalizeStorageKey(storageKey);
  const absolutePath = path.resolve(LOCAL_STORAGE_ROOT, normalizedKey);
  const relativePath = path.relative(LOCAL_STORAGE_ROOT, absolutePath);

  if (
    relativePath.startsWith('..')
    || path.isAbsolute(relativePath)
  ) {
    const err = new Error('Invalid storage key');
    err.status = 400;
    throw err;
  }

  return absolutePath;
}

async function saveDocument(buffer, storageKey) {
  const normalizedKey = normalizeStorageKey(storageKey);
  const absolutePath = resolveLocalPath(normalizedKey);

  ensureDirectory(path.dirname(absolutePath));
  fs.writeFileSync(absolutePath, buffer);

  return {
    storageProvider: LOCAL_STORAGE_PROVIDER,
    storageKey: normalizedKey,
  };
}

async function readDocument(storageProvider, storageKey) {
  if (storageProvider !== LOCAL_STORAGE_PROVIDER) {
    const err = new Error(`Unsupported storage provider: ${storageProvider}`);
    err.status = 500;
    throw err;
  }

  const absolutePath = resolveLocalPath(storageKey);
  if (!fs.existsSync(absolutePath)) {
    const err = new Error('Stored document file not found');
    err.status = 404;
    throw err;
  }

  return fs.readFileSync(absolutePath);
}

async function removeDocument(storageProvider, storageKey) {
  if (storageProvider !== LOCAL_STORAGE_PROVIDER) {
    const err = new Error(`Unsupported storage provider: ${storageProvider}`);
    err.status = 500;
    throw err;
  }

  const absolutePath = resolveLocalPath(storageKey);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

module.exports = {
  LOCAL_STORAGE_PROVIDER,
  saveDocument,
  readDocument,
  removeDocument,
};
