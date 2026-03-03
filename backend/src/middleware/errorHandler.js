const { sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const code = err.code || errorCodes.SERVER_001;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, message, code, status);
}

module.exports = errorHandler;