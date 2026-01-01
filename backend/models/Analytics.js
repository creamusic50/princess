const pool = require('../../config/database');

class Analytics {
  // Create analytics tables
  static async createTable() {
    try {
      // Create page_views table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS page_views (
          id SERIAL PRIMARY KEY,
          post_id INTEGER,
          post_title VARCHAR(255),
          country VARCHAR(100),
          country_code VARCHAR(10),
          referrer TEXT,
          traffic_source VARCHAR(100),
          user_agent TEXT,
          ip_address VARCHAR(45),
          session_id VARCHAR(255),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_page_views_post_id ON page_views(post_id);
        CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
        CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);
      `);

      // Create visitor_sessions table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS visitor_sessions (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) UNIQUE,
          ip_address VARCHAR(45),
          country VARCHAR(100),
          country_code VARCHAR(10),
          user_agent TEXT,
          first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          pageviews INTEGER DEFAULT 1
        );
        CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
        CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country);
      `);

      // Create traffic_sources table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS traffic_sources (
          id SERIAL PRIMARY KEY,
          referrer TEXT,
          traffic_source VARCHAR(100),
          country VARCHAR(100),
          post_id INTEGER,
          page_view_date DATE DEFAULT CURRENT_DATE,
          count INTEGER DEFAULT 1,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(referrer, traffic_source, country, post_id, page_view_date)
        );
        CREATE INDEX IF NOT EXISTS idx_traffic_sources_date ON traffic_sources(page_view_date);
        CREATE INDEX IF NOT EXISTS idx_traffic_sources_source ON traffic_sources(traffic_source);
      `);

      console.log('✅ Analytics tables created');
    } catch (error) {
      console.error('Error creating analytics tables:', error);
      throw error;
    }
  }

  // Record a page view
  static async recordPageView(data) {
    const {
      postId,
      postTitle,
      country,
      countryCode,
      referrer,
      trafficSource,
      userAgent,
      ipAddress,
      sessionId
    } = data;

    try {
      const result = await pool.query(
        `INSERT INTO page_views 
        (post_id, post_title, country, country_code, referrer, traffic_source, user_agent, ip_address, session_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [postId, postTitle, country, countryCode, referrer, trafficSource, userAgent, ipAddress, sessionId]
      );

      // Update traffic sources
      await pool.query(
        `INSERT INTO traffic_sources (referrer, traffic_source, country, page_view_date, count, post_id)
        VALUES ($1, $2, $3, CURRENT_DATE, 1, $4)
        ON CONFLICT DO NOTHING`,
        [referrer, trafficSource, country, postId]
      );

      // Update or insert visitor session
      const sessionResult = await pool.query(
        `SELECT id FROM visitor_sessions WHERE session_id = $1`,
        [sessionId]
      );

      if (sessionResult.rows.length > 0) {
        await pool.query(
          `UPDATE visitor_sessions 
          SET last_visit = CURRENT_TIMESTAMP, pageviews = pageviews + 1 
          WHERE session_id = $1`,
          [sessionId]
        );
      } else {
        await pool.query(
          `INSERT INTO visitor_sessions 
          (session_id, ip_address, country, country_code, user_agent)
          VALUES ($1, $2, $3, $4, $5)`,
          [sessionId, ipAddress, country, countryCode, userAgent]
        );
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error recording page view:', error);
      throw error;
    }
  }

  // Get analytics overview
  static async getOverview() {
    try {
      const overview = await pool.query(`
        SELECT 
          COUNT(DISTINCT session_id) as unique_visitors,
          COUNT(*) as total_pageviews,
          COUNT(DISTINCT DATE(timestamp)) as days_active,
          CASE 
            WHEN COUNT(DISTINCT session_id) = 0 THEN 0
            ELSE ROUND(COUNT(*) * 100.0 / COUNT(DISTINCT session_id), 2)
          END as avg_pageviews_per_visitor
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '30 days'
      `);

      const topPosts = await pool.query(`
        SELECT 
          post_id, post_title, COUNT(*) as views
        FROM page_views
        WHERE post_id IS NOT NULL AND timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY post_id, post_title
        ORDER BY views DESC
        LIMIT 10
      `);

      const countryBreakdown = await pool.query(`
        SELECT 
          country, 
          COUNT(DISTINCT session_id) as visitors,
          COUNT(*) as pageviews,
          CASE 
            WHEN (SELECT COUNT(*) FROM page_views WHERE timestamp >= NOW() - INTERVAL '30 days') = 0 THEN 0
            ELSE ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_views WHERE timestamp >= NOW() - INTERVAL '30 days'), 2)
          END as percentage
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '30 days' AND country IS NOT NULL
        GROUP BY country
        ORDER BY pageviews DESC
        LIMIT 15
      `);

      return {
        overview: overview.rows[0],
        topPosts: topPosts.rows,
        countryBreakdown: countryBreakdown.rows
      };
    } catch (error) {
      console.error('Error getting overview:', error);
      throw error;
    }
  }

  // Get data by country with percentage
  static async getByCountry(days = 30) {
    try {
      const result = await pool.query(`
        SELECT 
          country,
          COUNT(DISTINCT session_id) as visitors,
          COUNT(*) as pageviews,
          COUNT(DISTINCT post_id) as unique_posts_viewed,
          CASE 
            WHEN (SELECT COUNT(*) FROM page_views WHERE timestamp >= NOW() - INTERVAL '${days} days') = 0 THEN 0
            ELSE ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_views WHERE timestamp >= NOW() - INTERVAL '${days} days'), 2)
          END as percentage,
          STRING_AGG(DISTINCT traffic_source, ', ') as traffic_sources
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '${days} days' AND country IS NOT NULL
        GROUP BY country
        ORDER BY pageviews DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting country data:', error);
      throw error;
    }
  }

  // Get data by date range (day/week/month)
  static async getByDateRange(period = 'day') {
    try {
      let dateFormat;
      if (period === 'day') {
        dateFormat = "DATE(timestamp)";
      } else if (period === 'week') {
        dateFormat = "DATE_TRUNC('week', timestamp)";
      } else if (period === 'month') {
        dateFormat = "DATE_TRUNC('month', timestamp)";
      } else {
        dateFormat = "DATE(timestamp)";
      }

      const result = await pool.query(`
        SELECT 
          ${dateFormat} as date,
          COUNT(DISTINCT session_id) as visitors,
          COUNT(*) as pageviews,
          COUNT(DISTINCT post_id) as posts_viewed,
          CASE 
            WHEN COUNT(DISTINCT session_id) = 0 THEN 0
            ELSE ROUND(COUNT(*) * 100.0 / COUNT(DISTINCT session_id), 2)
          END as bounce_rate
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '90 days'
        GROUP BY ${dateFormat}
        ORDER BY date DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting date range data:', error);
      throw error;
    }
  }

  // Get data by traffic source
  static async getBySource(days = 30) {
    try {
      const result = await pool.query(`
        SELECT 
          traffic_source,
          referrer,
          COUNT(DISTINCT session_id) as unique_visitors,
          COUNT(*) as pageviews,
          COUNT(DISTINCT post_id) as posts_viewed,
          CASE 
            WHEN (SELECT COUNT(*) FROM page_views WHERE timestamp >= NOW() - INTERVAL '${days} days') = 0 THEN 0
            ELSE ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_views WHERE timestamp >= NOW() - INTERVAL '${days} days'), 2)
          END as percentage
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
        GROUP BY traffic_source, referrer
        ORDER BY pageviews DESC
        LIMIT 20
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting source data:', error);
      throw error;
    }
  }

  // Get top posts
  static async getTopPosts(days = 30, limit = 15) {
    try {
      const result = await pool.query(`
        SELECT 
          post_id,
          post_title,
          COUNT(DISTINCT session_id) as unique_visitors,
          COUNT(*) as total_views,
          COUNT(DISTINCT country) as countries,
          ROUND(AVG(EXTRACT(EPOCH FROM (SELECT MAX(timestamp) - MIN(timestamp) FROM page_views AS pv2 WHERE pv2.post_id = page_views.post_id)) / 60), 0) as avg_time_spent_minutes
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '${days} days' AND post_id IS NOT NULL
        GROUP BY post_id, post_title
        ORDER BY total_views DESC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting top posts:', error);
      throw error;
    }
  }

  // Get bounce rate and engagement metrics
  static async getEngagementMetrics(days = 30) {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(DISTINCT session_id) as total_sessions,
          COUNT(*) as total_pageviews,
          ROUND(COUNT(*) * 100.0 / COUNT(DISTINCT session_id), 2) as avg_pages_per_session,
          ROUND(
            (SELECT COUNT(DISTINCT session_id) FROM visitor_sessions WHERE pageviews = 1 AND first_visit >= NOW() - INTERVAL '${days} days') * 100.0 / 
            COUNT(DISTINCT session_id), 2
          ) as bounce_rate_percentage,
          ROUND(AVG(EXTRACT(EPOCH FROM (SELECT MAX(last_visit) - MIN(first_visit) FROM visitor_sessions AS vs2 WHERE vs2.id IN (
            SELECT DISTINCT ON (session_id) id FROM visitor_sessions ORDER BY session_id, last_visit DESC
          )))) / 60, 2) as avg_session_duration_minutes
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      throw error;
    }
  }
}

module.exports = Analytics;
