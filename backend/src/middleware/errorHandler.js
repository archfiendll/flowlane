function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  // Avoid leaking internals in production
  const payload = {
    message: err.message || "Internal server error",
  };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;