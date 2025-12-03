const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  next();
};

exports.validatePost = [
  (req, res, next) => {
    // Validate title
    if (!req.body.title || req.body.title.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 10 characters'
      });
    }
    
    // Validate content length (1000+ words for AdSense)
    if (req.body.content) {
      const plainText = req.body.content.replace(/<[^>]*>/g, '');
      const wordCount = plainText.trim().split(/\s+/).length;
      
      if (wordCount < 1000) {
        return res.status(400).json({
          success: false,
          message: `Content must be at least 1000 words (currently ${wordCount})`
        });
      }
    }
    
    next();
  }
];

exports.validateContact = [
  (req, res, next) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }
    
    if (!subject || subject.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Subject must be at least 5 characters'
      });
    }
    
    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters'
      });
    }
    
    next();
  }
];