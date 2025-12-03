const express = require('express');
const router = express.Router();
const { uploadPostImage, uploadPostImages, deleteFile, getFileUrl } = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/upload/image
// @desc    Upload single image
// @access  Private/Admin
router.post('/image', protect, admin, uploadPostImage, (req, res) => {
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
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: getFileUrl(req.file.filename)
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images
// @access  Private/Admin
router.post('/images', protect, admin, uploadPostImages, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: getFileUrl(file.filename)
    }));
    
    res.json({
      success: true,
      files: files,
      count: files.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files'
    });
  }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete uploaded file
// @access  Private/Admin
router.delete('/:filename', protect, admin, (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }
    
    const deleted = deleteFile(filename);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// @route   GET /api/upload/list
// @desc    List uploaded files
// @access  Private/Admin
router.get('/list', protect, admin, (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(__dirname, '../../public/uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        files: []
      });
    }
    
    const files = fs.readdirSync(uploadDir)
      .filter(file => !file.startsWith('.')) // Ignore hidden files
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          url: `/uploads/${file}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json({
      success: true,
      files: files,
      total: files.length
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing files'
    });
  }
});

module.exports = router;