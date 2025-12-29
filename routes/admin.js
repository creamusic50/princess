const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { protect, admin } = require('../middleware/auth');

const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'site-settings.json');

function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return {};
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error('Error reading settings:', e);
    return {};
  }
}

function writeSettings(obj) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing settings:', e);
    return false;
  }
}

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const [postStats, userStats] = await Promise.all([
      Post.getStatistics(),
      User.getAll(5, 0)
    ]);
    
    res.json({
      success: true,
      stats: {
        posts: postStats,
        users: userStats.total,
        recentUsers: userStats.users
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/posts
// @desc    Get all posts for admin (including drafts)
// @access  Private/Admin
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const category = req.query.category || null;
    const status = req.query.status || null;
    
    const result = await Post.getAll({
      page,
      limit,
      category,
      published: status === 'draft' ? false : status === 'published' ? true : null
    });
    
    res.json({
      success: true,
      posts: result.posts,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });
  } catch (error) {
    console.error('Admin posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const result = await User.getAll(limit, offset);
    
    res.json({
      success: true,
      users: result.users,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/ga
// @desc    Get GA Measurement ID (admin only)
// @access  Private/Admin
router.get('/ga', protect, admin, async (req, res) => {
  try {
    const settings = readSettings();
    return res.json({ success: true, measurementId: settings.gaMeasurementId || null });
  } catch (error) {
    console.error('Error reading GA setting:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/ga
// @desc    Set GA Measurement ID (admin only)
// @access  Private/Admin
router.put('/ga', protect, admin, async (req, res) => {
  try {
    const measurementId = (req.body.measurementId || '').trim();

    // Basic validation: GA4 Measurement IDs start with G-
    if (measurementId && !/^G-[A-Z0-9]+$/i.test(measurementId)) {
      return res.status(400).json({ success: false, message: 'Invalid Measurement ID format' });
    }

    const settings = readSettings();
    if (measurementId) settings.gaMeasurementId = measurementId;
    else delete settings.gaMeasurementId;

    const ok = writeSettings(settings);
    if (!ok) return res.status(500).json({ success: false, message: 'Failed to save settings' });

    res.json({ success: true, measurementId: settings.gaMeasurementId || null });
  } catch (error) {
    console.error('Error saving GA setting:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;