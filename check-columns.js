require('dotenv').config();
const { query } = require('./config/database');

async function checkSchema() {
  try {
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'posts'
      ORDER BY ordinal_position
    `);
    console.log('Posts table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

checkSchema();
