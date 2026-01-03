const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const postController = require('../../controllers/postController');
const { protect, admin } = require('../../middleware/auth');

// @route   POST /api/admin/posts
// @desc    Create a new post (admin only)
// @access  Private/Admin
router.post('/posts', protect, admin, postController.createPost);

// @route   PUT /api/admin/posts/:id
// @desc    Update a post (admin only)
// @access  Private/Admin
router.put('/posts/:id', protect, admin, postController.updatePost);

// @route   DELETE /api/admin/posts/:id
// @desc    Delete a post (admin only)
// @access  Private/Admin
router.delete('/posts/:id', protect, admin, postController.deletePost);

// @route   GET /api/admin/posts
// @desc    Get all posts including unpublished (admin only)
// @access  Private/Admin
router.get('/posts', protect, admin, postController.getPosts);

module.exports = router;
