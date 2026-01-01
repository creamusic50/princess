const pool = require('../../config/database');

async function migrateAnalytics() {
  try {
    console.log('Creating analytics tables...');

    // Create page_views table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        post_id INTEGER,
        post_title VARCHAR(500),
        country VARCHAR(100),
        country_code VARCHAR(10),
        referrer TEXT,
        traffic_source VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        ip_address VARCHAR(50),
        session_id VARCHAR(100)
      )
    `);

    // Create indexes for fast queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_post_id ON page_views(post_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_traffic_source ON page_views(traffic_source)
    `);

    // Create visitor_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitor_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) UNIQUE,
        ip_address VARCHAR(50),
        country VARCHAR(100),
        country_code VARCHAR(10),
        first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pageviews INTEGER DEFAULT 1,
        user_agent TEXT
      )
    `);

    // Create indexes for visitor sessions
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_visitor_sessions_first_visit ON visitor_sessions(first_visit)
    `);

    // Create traffic_sources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS traffic_sources (
        id SERIAL PRIMARY KEY,
        referrer TEXT,
        traffic_source VARCHAR(50),
        country VARCHAR(100),
        page_view_date DATE DEFAULT CURRENT_DATE,
        count INTEGER DEFAULT 1,
        post_id INTEGER
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_traffic_sources_date ON traffic_sources(page_view_date)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_traffic_sources_source ON traffic_sources(traffic_source)
    `);

    console.log('✅ Analytics tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateAnalytics();
