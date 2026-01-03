const express = require('express');
const router = express.Router();
const { protect, admin } = require('../../middleware/auth');
const { uploadSingle } = require('../../middleware/upload');

// @route   POST /api/upload
// @desc    Upload a file
// @access  Private/Admin
router.post('/', protect, admin, uploadSingle('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
});

module.exports = router;
