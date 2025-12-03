require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function resetPassword() {
  try {
    console.log('🔄 Password Reset Tool\n');
    
    // Get email from command line argument or use default
    const email = process.argv[2] || 'admin@smartmoneyguide.com';
    const newPassword = process.argv[3] || 'Admin123!';
    
    console.log(`Resetting password for: ${email}`);
    console.log(`New password: ${newPassword}\n`);
    
    // Check if user exists
    const checkSql = 'SELECT * FROM users WHERE email = $1';
    const userResult = await query(checkSql, [email]);
    
    if (userResult.rows.length === 0) {
      console.error('❌ User not found with email:', email);
      process.exit(1);
    }
    
    const user = userResult.rows[0];
    console.log('Found user:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const updateSql = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, username, email, role
    `;
    
    const result = await query(updateSql, [hashedPassword, user.id]);
    
    if (result.rows.length > 0) {
      console.log('\n✅ Password reset successful!');
      console.log('\nYou can now login with:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${newPassword}`);
    } else {
      console.error('❌ Failed to reset password');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();
