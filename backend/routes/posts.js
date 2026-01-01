const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Post = require('../../models/Post');
const { protect, admin } = require('../../middleware/auth');
const Cache = require('../utils/cache');

// Initialize cache with 5 minute TTL for list queries, 10 minutes for detail
const postCache = new Cache(300);
const detailCache = new Cache(600);

// @route   GET /api/posts
// @desc    Get all published posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const category = req.query.category || null;
    const search = req.query.search || null;
    
    // Build cache key
    const cacheKey = `posts:${page}:${limit}:${category || 'all'}:${search || 'none'}`;
    
    // Check cache first
    let result = postCache.get(cacheKey);
    
    if (!result) {
      result = await Post.getAll({
        page,
        limit,
        category,
        published: true,
        search
      });
      
      // Cache the result
      postCache.set(cacheKey, result);
    }
    
    // Add cache headers for client-side caching
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    
    res.json({
      success: true,
      posts: result.posts,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/:slug
// @desc    Get single post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const cacheKey = `post:${req.params.slug}`;
    
    // Check cache first
    let post = detailCache.get(cacheKey);
    
    if (!post) {
      post = await Post.findBySlug(req.params.slug);
      // Cache the result
      detailCache.set(cacheKey, post);
    }
    
    // Add cache headers for client-side caching
    res.set('Cache-Control', 'public, max-age=600, s-maxage=1200');
    
    res.json({
      success: true,
      post
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    console.error('Error getting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/category/:category
// @desc    Get posts by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    
    const result = await Post.getByCategory(req.params.category, limit, page);
    
    res.json({
      success: true,
      posts: result.posts,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });
  } catch (error) {
    console.error('Error getting category posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Fast word count validation only when publishing (allow drafts)
    const willBePublished = req.body.published === undefined ? true : !!req.body.published;
    const plainText = (req.body.content || '').replace(/<[^>]*>/g, '').trim();
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;

    if (willBePublished && wordCount < 1000) {
      return res.status(400).json({
        success: false,
        message: `Content must be at least 1000 words (currently ${wordCount}) when publishing. Save as draft to skip this requirement.`
      });
    }
    
    const post = await Post.create({
      title: req.body.title,
      category: req.body.category,
      excerpt: req.body.excerpt,
      content: req.body.content,
      author_id: req.user.id,
      published: req.body.published !== undefined ? req.body.published : true,
      meta_description: req.body.meta_description || null,
      keywords: req.body.keywords || null
    });
    
    // Invalidate cache on new post
    postCache.flush();
    
    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private/Admin
router.put('/:id', [
  protect,
  admin,
  body('title').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('content').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Determine whether the post will be published after this update
    const willBePublished = req.body.published === undefined ? !!post.published : !!req.body.published;

    // If content is provided or the post will be published, validate word count
    if (willBePublished) {
      const contentToCheck = req.body.content !== undefined ? req.body.content : (post.content || '');
      const plainText = (contentToCheck || '').replace(/<[^>]*>/g, '').trim();
      const wordCount = plainText ? plainText.split(/\s+/).length : 0;

      if (wordCount < 1000) {
        return res.status(400).json({
          success: false,
          message: `Content must be at least 1000 words (currently ${wordCount}) when publishing.`
        });
      }
    }
    
    const updatedPost = await Post.update(req.params.id, req.body);
    
    // Invalidate cache on update
    postCache.flush();
    detailCache.flush();
    
    res.json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    await Post.delete(req.params.id);
    
    // Invalidate cache on delete
    postCache.flush();
    detailCache.flush();
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
