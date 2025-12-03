const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

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

module.exports = router;