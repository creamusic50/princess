const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  // Create user table
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await query(sql);
    console.log('✅ Users table created/verified');
  }

  // Create admin user if not exists
  static async createAdminUser() {
    try {
      // Check if admin exists
      const checkSql = 'SELECT * FROM users WHERE email = $1';
      const existingAdmin = await query(checkSql, ['admin@smartmoneyguide.com']);
      
      if (existingAdmin.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        
        const insertSql = `
          INSERT INTO users (username, email, password, role) 
          VALUES ($1, $2, $3, $4) 
          RETURNING id, username, email, role, created_at
        `;
        
        const result = await query(insertSql, [
          'admin',
          'admin@smartmoneyguide.com',
          hashedPassword,
          'admin'
        ]);
        
        console.log('✅ Admin user created:', result.rows[0].email);
        return result.rows[0];
      }
      
      console.log('✅ Admin user already exists');
      return existingAdmin.rows[0];
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
    }
  }

  // Register new user
  static async register({ username, email, password, role = 'user' }) {
    try {
      // Check if user exists
      const checkSql = 'SELECT * FROM users WHERE email = $1 OR username = $2';
      const existing = await query(checkSql, [email, username]);
      
      if (existing.rows.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user
      const insertSql = `
        INSERT INTO users (username, email, password, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, username, email, role, created_at
      `;
      
      const result = await query(insertSql, [username, email, hashedPassword, role]);
      const user = result.rows[0];
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Find user
      const sql = 'SELECT * FROM users WHERE email = $1';
      const result = await query(sql, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }
      
      const user = result.rows[0];
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password from user object
      delete user.password;
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const sql = 'SELECT id, username, email, role, created_at FROM users WHERE id = $1';
      const result = await query(sql, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (updates.username) {
        fields.push(`username = $${paramCount}`);
        values.push(updates.username);
        paramCount++;
      }
      
      if (updates.email) {
        fields.push(`email = $${paramCount}`);
        values.push(updates.email);
        paramCount++;
      }
      
      if (updates.password) {
        const hashedPassword = await bcrypt.hash(updates.password, 10);
        fields.push(`password = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
      }
      
      if (updates.role) {
        fields.push(`role = $${paramCount}`);
        values.push(updates.role);
        paramCount++;
      }
      
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      const sql = `
        UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, username, email, role, created_at, updated_at
      `;
      
      values.push(id);
      const result = await query(sql, values);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const sql = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await query(sql, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAll(limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT id, username, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const countSql = 'SELECT COUNT(*) FROM users';
      
      const [usersResult, countResult] = await Promise.all([
        query(sql, [limit, offset]),
        query(countSql)
      ]);
      
      return {
        users: usersResult.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;