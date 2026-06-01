require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  satusehat: {
    baseUrl: process.env.SATUSEHAT_BASE_URL || 'https://api-satusehat-stg.dto.kemkes.go.id',
    orgId: process.env.SATUSEHAT_ORG_ID || '10000004',
    clientId: process.env.SATUSEHAT_CLIENT_ID,
    clientSecret: process.env.SATUSEHAT_CLIENT_SECRET,
  },
  auth: {
    adminUsername: process.env.AUTH_ADMIN_USERNAME || 'admin',
    adminPassword: process.env.AUTH_ADMIN_PASSWORD || 'admin123',
    sessionTtlHours: Number(process.env.AUTH_SESSION_TTL_HOURS) || 24,
  },
};
