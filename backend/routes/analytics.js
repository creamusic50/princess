const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const { protect, admin } = require('../../middleware/auth');

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
    const { postId, postTitle, country, countryCode, referrer, trafficSource, userAgent, ipAddress, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
    }

    await Analytics.recordPageView({
      postId,
      postTitle,
      country,
      countryCode,
      referrer: referrer || 'direct',
      trafficSource,
      userAgent,
      ipAddress,
      sessionId
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
