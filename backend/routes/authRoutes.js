const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/login',
  loginLimiter,
  [
    body('username').trim().isLength({ min: 1, max: 50 }).escape(),
    body('password').isLength({ min: 1, max: 200 }),
  ],
  authController.login
);

router.get('/me', requireAuth, authController.me);

router.post(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').isLength({ min: 1, max: 200 }),
    body('newPassword').isLength({ min: 10, max: 200 }),
  ],
  authController.changePassword
);

module.exports = router;
