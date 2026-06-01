const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return sendError(res, 'Username dan password wajib diisi', 400);
    }

    const result = authService.login(username, password);
    return sendSuccess(res, result, 'Login berhasil');
  } catch (err) {
    return next(err);
  }
};

// POST /api/v1/auth/logout
const logout = async (req, res) => {
  authService.logout(req.sessionToken);
  return sendSuccess(res, null, 'Logout berhasil');
};

// GET /api/v1/auth/me
const me = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'Profil pengguna');
};

module.exports = {
  login,
  logout,
  me,
};
