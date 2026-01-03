const express = require('express');
const router = express.Router();

// @route   GET /api/meta/:slug
// @desc    Get meta data for a post
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    // This endpoint can be used to serve meta data for posts
    // if needed for SEO or social sharing
    res.json({
      success: true,
      message: 'Meta endpoint'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
