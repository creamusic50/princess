const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const contactController = require('../../controllers/contactController');

// @route   POST /api/contact
// @desc    Send contact form email
// @access  Public
router.post('/',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('subject').notEmpty(),
  body('message').notEmpty(),
  contactController.sendContact
);

module.exports = router;
