const authService = require('../services/authService');
const extractBearerToken = require('../utils/extractBearerToken');
const { sendError } = require('../utils/response');

const authGuard = (req, res, next) => {
  const token = extractBearerToken(req);
  const user = authService.getSession(token);

  if (!user) {
    return sendError(res, 'Unauthorized — sesi tidak valid atau sudah berakhir', 401);
  }

  req.user = user;
  req.sessionToken = token;
  return next();
};

module.exports = authGuard;
