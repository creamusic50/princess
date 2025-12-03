const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const category = req.query.category || null;
    const search = req.query.search || null;
    
    const result = await Post.getAll({
      page,
      limit,
      category,
      published: true,
      search
    });
    
    res.json({
      success: true,
      posts: result.posts,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findBySlug(req.params.slug);
    
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
    
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    // Check word count (1000+ words for AdSense)
    const plainText = req.body.content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.trim().split(/\s+/).length;
    
    if (wordCount < 1000) {
      return res.status(400).json({
        success: false,
        message: `Content must be at least 1000 words (currently ${wordCount})`
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
    
    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    
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
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check word count if content is being updated
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
    
    const updatedPost = await Post.update(req.params.id, req.body);
    
    res.json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    await Post.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};