const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);
  if (err.satusehatResponse) {
    console.error('[SATUSEHAT Response]', JSON.stringify(err.satusehatResponse, null, 2));
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const extras = err.satusehatResponse ? { satusehatResponse: err.satusehatResponse } : null;
  return sendError(res, message, statusCode, extras);
};

module.exports = errorHandler;
