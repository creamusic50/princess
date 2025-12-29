require('dotenv').config();
const { pool } = require('../config/database');

async function ensure() {
  try {
    console.log('🔧 Ensuring posts table has required columns...');
    const client = await pool.connect();
    try {
      await client.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url VARCHAR(1000);");
      await client.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160);");
      await client.query("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='keywords') THEN ALTER TABLE posts ADD COLUMN keywords TEXT[]; END IF; END$$;");
      console.log('✅ Ensured columns: image_url, meta_description, keywords');
    } finally {
      client.release();
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to ensure columns:', err.stack || err);
    process.exit(1);
  }
}

ensure();
