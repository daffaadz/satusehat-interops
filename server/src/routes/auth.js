const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authGuard = require('../middleware/authGuard');

router.post('/login', authController.login);
router.post('/logout', authGuard, authController.logout);
router.get('/me', authGuard, authController.me);

module.exports = router;
