const { query } = require('../config/database');

class Category {
  // Create categories table
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        description TEXT,
        post_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await query(sql);
    
    // Create default categories
    const defaultCategories = [
      { name: 'Saving Tips', slug: 'saving-tips', description: 'Money saving strategies and tips' },
      { name: 'Investing', slug: 'investing', description: 'Stock market and investment guides' },
      { name: 'Budgeting', slug: 'budgeting', description: 'Budget creation and management' },
      { name: 'Retirement', slug: 'retirement', description: 'Retirement planning and strategies' },
      { name: 'Credit Cards', slug: 'credit-cards', description: 'Credit card reviews and optimization' },
      { name: 'Money Management', slug: 'money-management', description: 'General money management advice' }
    ];
    
    for (const category of defaultCategories) {
      await query(`
        INSERT INTO categories (name, slug, description) 
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `, [category.name, category.slug, category.description]);
    }
    
    console.log('✅ Categories table created/verified');
  }

  // Get all categories
  static async getAll() {
    try {
      const sql = `
        SELECT * FROM categories 
        ORDER BY post_count DESC, name ASC
      `;
      
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get category by slug
  static async findBySlug(slug) {
    try {
      const sql = 'SELECT * FROM categories WHERE slug = $1';
      const result = await query(sql, [slug]);
      
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create category
  static async create({ name, description }) {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      const sql = `
        INSERT INTO categories (name, slug, description) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `;
      
      const result = await query(sql, [name, slug, description]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Category already exists');
      }
      throw error;
    }
  }

  // Update category
  static async update(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (updates.name) {
        fields.push(`name = $${paramCount}`);
        values.push(updates.name);
        paramCount++;
        
        // Update slug if name changed
        const slug = updates.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        fields.push(`slug = $${paramCount}`);
        values.push(slug);
        paramCount++;
      }
      
      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount}`);
        values.push(updates.description);
        paramCount++;
      }
      
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      const sql = `
        UPDATE categories 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      
      values.push(id);
      const result = await query(sql, values);
      
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete category
  static async delete(id) {
    try {
      const sql = 'DELETE FROM categories WHERE id = $1 RETURNING id';
      const result = await query(sql, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Update post count for category
  static async updatePostCount(categoryName) {
    try {
      const sql = `
        UPDATE categories 
        SET post_count = (
          SELECT COUNT(*) FROM posts 
          WHERE category = $1 AND published = true
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE name = $1
      `;
      
      await query(sql, [categoryName]);
    } catch (error) {
      console.error('Error updating post count:', error);
    }
  }
}

module.exports = Category;