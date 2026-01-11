const express = require('express');
const router = express.Router();
const Analytics = require('../backend/models/Analytics');
const { protect, admin } = require('../middleware/auth');

// Get analytics overview (admin only)
router.get('/overview', protect, admin, async (req, res) => {
  try {
    const data = await Analytics.getOverview();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics overview',
      error: error.message
    });
  }
});

// Get data by country (admin only)
router.get('/by-country', protect, admin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await Analytics.getByCountry(days);
    res.json({
      success: true,
      data,
      period: `Last ${days} days`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching country data',
      error: error.message
    });
  }
});

// Get data by date range (admin only)
router.get('/by-date', protect, admin, async (req, res) => {
  try {
    const period = req.query.period || 'day'; // day, week, month
    const data = await Analytics.getByDateRange(period);
    res.json({
      success: true,
      data,
      period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching date range data',
      error: error.message
    });
  }
});

// Get data by traffic source (admin only)
router.get('/by-source', protect, admin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await Analytics.getBySource(days);
    res.json({
      success: true,
      data,
      period: `Last ${days} days`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching traffic source data',
      error: error.message
    });
  }
});

// Get top posts (admin only)
router.get('/top-posts', protect, admin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const limit = parseInt(req.query.limit) || 15;
    const data = await Analytics.getTopPosts(days, limit);
    res.json({
      success: true,
      data,
      period: `Last ${days} days`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top posts',
      error: error.message
    });
  }
});

// Get engagement metrics (admin only)
router.get('/engagement', protect, admin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await Analytics.getEngagementMetrics(days);
    res.json({
      success: true,
      data,
      period: `Last ${days} days`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching engagement metrics',
      error: error.message
    });
  }
});

// Public endpoint to record page views (used by frontend tracker)
router.post('/track', async (req, res) => {
  try {
    const { postId, postTitle, country, countryCode, referrer, trafficSource, userAgent, ipAddress, sessionId, page } = req.body;

    // SessionId is optional - will be generated if missing
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Allow tracking without all fields (page tracking only)
    await Analytics.recordPageView({
      postId: postId || null,
      postTitle: postTitle || page || '/',
      country: country || null,
      countryCode: countryCode || null,
      referrer: referrer || 'direct',
      trafficSource: trafficSource || 'direct',
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      sessionId: finalSessionId
    });

    res.json({
      success: true,
      message: 'Page view recorded'
    });
  } catch (error) {
    console.error('Error recording page view:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording page view',
      error: error.message
    });
  }
});

module.exports = router;
