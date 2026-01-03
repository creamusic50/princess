const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  authController.register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  authController.login
);

module.exports = router;
