require('dotenv').config();
const { query, pool } = require('../config/database');

async function addColumns() {
  console.log('🔧 Adding missing columns to posts table (if needed)...');

  try {
    await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160);");
    console.log('✅ Ensured column: meta_description');

    await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS keywords TEXT[];");
    console.log('✅ Ensured column: keywords');

    console.log('\nAll done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

addColumns();
