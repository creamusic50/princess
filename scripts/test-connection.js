require('dotenv').config();
const { query } = require('../config/database');

async function testConnection() {
  console.log('🔌 Testing PostgreSQL (Neon) connection...');
  
  try {
    // Test connection
    const result = await query('SELECT version()');
    console.log('✅ PostgreSQL Connection Successful!');
    console.log('📊 Database Version:', result.rows[0].version);
    
    // Test tables
    console.log('\n📋 Checking tables...');
    
    const tables = ['users', 'posts', 'categories'];
    
    for (const table of tables) {
      try {
        const countResult = await query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: ${countResult.rows[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Table not found or error`);
      }
    }
    
    // Test sample query
    console.log('\n🧪 Testing sample queries...');
    
    const users = await query('SELECT COUNT(*) as count FROM users');
    const posts = await query('SELECT COUNT(*) as count FROM posts WHERE published = true');
    const categories = await query('SELECT DISTINCT category FROM posts');
    
    console.log(`👥 Users: ${users.rows[0].count}`);
    console.log(`📝 Published Posts: ${posts.rows[0].count}`);
    console.log(`🏷️ Categories: ${categories.rows.map(c => c.category).join(', ')}`);
    
    console.log('\n🎉 All tests passed! Database is ready.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Make sure Neon PostgreSQL is running');
    console.log('3. Check if IP is allowed in Neon dashboard');
    console.log('4. Verify SSL settings (sslmode=require)');
    
    process.exit(1);
  }
}

testConnection();