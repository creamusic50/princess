require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function createAdmin() {
  console.log('👑 Creating admin user...');
  
  try {
    const email = process.argv[2] || 'admin@smartmoneyguide.com';
    const password = process.argv[3] || 'Admin123!';
    const username = process.argv[4] || 'admin';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const checkSql = 'SELECT * FROM users WHERE email = $1';
    const existing = await query(checkSql, [email]);
    
    if (existing.rows.length > 0) {
      console.log(`⚠️ User ${email} already exists`);
      console.log(`Updating to admin role...`);
      
      const updateSql = 'UPDATE users SET role = $1, password = $2 WHERE email = $3 RETURNING *';
      const result = await query(updateSql, ['admin', hashedPassword, email]);
      
      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email:', result.rows[0].email);
      console.log('🔑 Password:', password);
      console.log('👤 Role:', result.rows[0].role);
    } else {
      // Insert new admin
      const insertSql = `
        INSERT INTO users (username, email, password, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const result = await query(insertSql, [username, email, hashedPassword, 'admin']);
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', result.rows[0].email);
      console.log('🔑 Password:', password);
      console.log('👤 Role:', result.rows[0].role);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();