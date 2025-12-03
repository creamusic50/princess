const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// @route   POST /api/contact
// @desc    Send contact message
// @access  Public
router.post('/', [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { name, email, subject, message } = req.body;
    
    // Save to database (you can add a Contact model if needed)
    // For now, just send email
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Email content
    const mailOptions = {
      from: `"Smart Money Guide" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2c3e50;">New Contact Form Submission</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            This message was sent from the Smart Money Guide contact form.
          </p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Send auto-reply to user
    const autoReplyOptions = {
      from: `"Smart Money Guide" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank you for contacting Smart Money Guide',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2c3e50;">Thank You for Contacting Us!</h2>
          <p>Hello ${name},</p>
          <p>We've received your message and will get back to you within 24-48 hours.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p style="font-style: italic;">"${message}"</p>
          </div>
          <p>Best regards,<br>The Smart Money Guide Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(autoReplyOptions);
    
    res.json({
      success: true,
      message: 'Message sent successfully!'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    // If email fails, still respond success (for demo purposes)
    // In production, you should save to database as fallback
    res.json({
      success: true,
      message: 'Message received! (Note: Email notification failed)'
    });
  }
});

module.exports = router;