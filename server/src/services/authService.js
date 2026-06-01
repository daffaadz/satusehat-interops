const crypto = require('crypto');
const config = require('../config');

/** @type {Map<string, { user: object, expiresAt: number }>} */
const sessions = new Map();

const getSessionTtlMs = () => config.auth.sessionTtlHours * 60 * 60 * 1000;

const validateCredentials = (username, password) => {
  const { adminUsername, adminPassword } = config.auth;

  if (username !== adminUsername || password !== adminPassword) {
    const err = new Error('Username atau password salah');
    err.statusCode = 401;
    throw err;
  }

  return {
    username: adminUsername,
    name: 'Admin Klinik Percobaan',
    role: 'admin',
  };
};

const createSession = (user) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + getSessionTtlMs();
  sessions.set(token, { user, expiresAt });
  return token;
};

const getSession = (token) => {
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session.user;
};

const destroySession = (token) => {
  if (token) sessions.delete(token);
};

const login = (username, password) => {
  const user = validateCredentials(username, password);
  const token = createSession(user);
  return { token, user };
};

const logout = (token) => {
  destroySession(token);
};

module.exports = {
  login,
  logout,
  getSession,
  destroySession,
};
