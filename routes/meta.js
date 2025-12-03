const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// @route   GET /api/meta/stats
// @desc    Get website statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Post.getStatistics();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/meta/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Post.getCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/meta/sitemap
// @desc    Generate dynamic sitemap
// @access  Public
router.get('/sitemap', async (req, res) => {
  try {
    const posts = await Post.getAll({
      limit: 1000,
      published: true
    });
    
    // Generate XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://smartmoneyguide.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://smartmoneyguide.com/about.html</loc>
    <lastmod>2025-11-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://smartmoneyguide.com/contact.html</loc>
    <lastmod>2025-11-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    
    // Add blog posts
    posts.posts.forEach(post => {
      const lastmod = new Date(post.updated_at || post.created_at).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>https://smartmoneyguide.com/post.html?slug=${encodeURIComponent(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });
    
    xml += '\n</urlset>';
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;