const { query } = require('../config/database');
const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');

async function initializeDatabase() {
  try {
    console.log('🔄 Starting database initialization...\n');

    // Test connection
    console.log('1️⃣ Testing database connection...');
    const result = await query('SELECT NOW()');
    console.log('✅ Database connected at:', result.rows[0].now);
    console.log('');

    // Create tables
    console.log('2️⃣ Creating/verifying tables...');
    
    await User.createTable();
    await Category.createTable();
    await Post.createTable();
    
    console.log('');

    // Check if admin user exists
    console.log('3️⃣ Checking for admin user...');
    try {
      const adminCheck = await query('SELECT * FROM users WHERE username = $1', ['admin']);
      if (adminCheck.rows.length === 0) {
        console.log('⚠️ No admin user found');
        console.log('Creating default admin user...');
        
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        await query(
          'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4)',
          ['admin', 'admin@tilana.online', hashedPassword, true]
        );
        
        console.log('✅ Admin user created');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   ⚠️ IMPORTANT: Change this password after first login!');
      } else {
        console.log('✅ Admin user exists');
      }
    } catch (error) {
      console.error('❌ Error checking/creating admin:', error.message);
    }
    
    console.log('');

    // Check posts
    console.log('4️⃣ Checking posts...');
    const postsCount = await query('SELECT COUNT(*) FROM posts');
    console.log(`✅ Found ${postsCount.rows[0].count} posts in database`);
    
    console.log('');
    console.log('🎉 Database initialization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm start');
    console.log('2. Visit: http://localhost:5000');
    console.log('3. Admin: http://localhost:5000/admin.html');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in .env file');
    console.error('2. Ensure your database is accessible');
    console.error('3. Verify your database credentials');
    process.exit(1);
  }
}

initializeDatabase();
