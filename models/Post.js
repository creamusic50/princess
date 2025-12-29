const { query } = require('../config/database');
const slugify = require('slugify');

class Post {
  // Create posts table
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(300) UNIQUE NOT NULL,
        image_url VARCHAR(1000),
        category VARCHAR(100) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        views INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        meta_description VARCHAR(160),
        keywords TEXT[]
      )
    `;
    
    await query(sql);
    
    // Create indexes for performance
    await query('CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)');
    await query('CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published)');
    await query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)');
    
    console.log('✅ Posts table created/verified');
  }

  // Generate slug from title
  static generateSlug(title) {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    }) + '-' + Date.now().toString().slice(-6);
  }

  // Create new post
  static async create({ 
    title, 
    category, 
    excerpt, 
    content, 
    author_id, 
    published = true,
    meta_description = null,
    keywords = null,
    image_url = null
  }) {
    try {
      const slug = this.generateSlug(title);
      
      // Ensure deployments can opt-in to storing an image URL.
      // Insert core columns + optional image_url support.
      const sqlWithImage = `
        INSERT INTO posts (
          title, slug, category, excerpt, content, 
          author_id, published, image_url
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `;

      try {
        const result = await query(sqlWithImage, [
          title, slug, category, excerpt, content, 
          author_id, published, image_url
        ]);
        return result.rows[0];
      } catch (err) {
        // If image_url column doesn't exist, retry without it (defensive)
        if (err.message && err.message.toLowerCase().includes('image_url')) {
          const sql = `
            INSERT INTO posts (
              title, slug, category, excerpt, content, 
              author_id, published
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
          `;

          const result = await query(sql, [
            title, slug, category, excerpt, content,
            author_id, published
          ]);
          return result.rows[0];
        }
        throw err;
      }
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Slug already exists, try a different title');
      }
      throw error;
    }
  }

  // Get post by slug (increments views)
  static async findBySlug(slug) {
    try {
      // First increment view count
      await query(
        'UPDATE posts SET views = views + 1 WHERE slug = $1',
        [slug]
      );
      
      // Then get the post with author info
      const sql = `
        SELECT 
          p.*,
          u.username as author_name,
          u.email as author_email
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.slug = $1 AND p.published = true
      `;
      
      const result = await query(sql, [slug]);
      
      if (result.rows.length === 0) {
        throw new Error('Post not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get post by ID (for admin)
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM posts WHERE id = $1';
      const result = await query(sql, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Post not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all posts with pagination and filtering
  static async getAll({
    page = 1,
    limit = 10,
    category = null,
    published = true,
    search = null
  }) {
    try {
      const offset = (page - 1) * limit;
      
      let conditions = ['1=1'];
      const params = [];
      let paramCount = 1;
      
      if (published !== null) {
        conditions.push(`published = $${paramCount}`);
        params.push(published);
        paramCount++;
      }
      
      if (category) {
        conditions.push(`category = $${paramCount}`);
        params.push(category);
        paramCount++;
      }
      
      if (search) {
        conditions.push(`(
          title ILIKE $${paramCount} OR 
          excerpt ILIKE $${paramCount} OR 
          content ILIKE $${paramCount}
        )`);
        params.push(`%${search}%`);
        paramCount++;
      }
      
      const whereClause = conditions.join(' AND ');
      
      // Get posts
      const postsSql = `
        SELECT 
          p.*,
          u.username as author_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      
      // Get total count
      const countSql = `
        SELECT COUNT(*) FROM posts WHERE ${whereClause}
      `;
      
      const postsParams = [...params, limit, offset];
      
      const [postsResult, countResult] = await Promise.all([
        query(postsSql, postsParams),
        query(countSql, params)
      ]);
      
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);
      
      return {
        posts: postsResult.rows,
        total,
        totalPages,
        currentPage: page,
        limit
      };
    } catch (error) {
      throw error;
    }
  }

  // Get posts by category
  static async getByCategory(category, limit = 10, page = 1) {
    return this.getAll({
      category,
      limit,
      page,
      published: true
    });
  }

  // Get related posts (same category, different post)
  static async getRelated(category, currentPostId, limit = 3) {
    try {
      const sql = `
        SELECT * FROM posts 
        WHERE category = $1 
          AND id != $2 
          AND published = true
        ORDER BY created_at DESC 
        LIMIT $3
      `;
      
      const result = await query(sql, [category, currentPostId, limit]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update post
  static async update(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (updates.title) {
        fields.push(`title = $${paramCount}`);
        values.push(updates.title);
        paramCount++;
        
        // Generate new slug if title changed
        if (updates.title) {
          const newSlug = this.generateSlug(updates.title);
          fields.push(`slug = $${paramCount}`);
          values.push(newSlug);
          paramCount++;
        }
      }
      
      if (updates.category) {
        fields.push(`category = $${paramCount}`);
        values.push(updates.category);
        paramCount++;
      }
      
      if (updates.excerpt !== undefined) {
        fields.push(`excerpt = $${paramCount}`);
        values.push(updates.excerpt);
        paramCount++;
      }
      
      if (updates.content) {
        fields.push(`content = $${paramCount}`);
        values.push(updates.content);
        paramCount++;
      }
      
      if (updates.published !== undefined) {
        fields.push(`published = $${paramCount}`);
        values.push(updates.published);
        paramCount++;
      }
      
      if (updates.meta_description !== undefined) {
        fields.push(`meta_description = $${paramCount}`);
        values.push(updates.meta_description);
        paramCount++;
      }
      
      if (updates.keywords !== undefined) {
        fields.push(`keywords = $${paramCount}`);
        values.push(updates.keywords ? updates.keywords.split(',').map(k => k.trim()) : null);
        paramCount++;
      }

      if (updates.image_url !== undefined) {
        // Add image_url only if the column exists (defensive)
        try {
          const colCheck = await query("SELECT column_name FROM information_schema.columns WHERE table_name='posts' AND column_name='image_url'");
          if (colCheck && colCheck.rows && colCheck.rows.length > 0) {
            fields.push(`image_url = $${paramCount}`);
            values.push(updates.image_url || null);
            paramCount++;
          }
        } catch (e) {
          // ignore and continue without image_url
          console.warn('Could not verify image_url column existence, skipping image update', e && e.message);
        }
      }
      
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      const sql = `
        UPDATE posts 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      
      values.push(id);
      const result = await query(sql, values);
      
      if (result.rows.length === 0) {
        throw new Error('Post not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete post
  static async delete(id) {
    try {
      const sql = 'DELETE FROM posts WHERE id = $1 RETURNING id';
      const result = await query(sql, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Post not found');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get post statistics
  static async getStatistics() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_posts,
          COUNT(CASE WHEN published = true THEN 1 END) as published_posts,
          COUNT(CASE WHEN published = false THEN 1 END) as draft_posts,
          COALESCE(SUM(views), 0) as total_views,
          COUNT(DISTINCT category) as unique_categories
        FROM posts
      `;
      
      const result = await query(sql);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all categories with post counts
  static async getCategories() {
    try {
      const sql = `
        SELECT 
          category as name,
          COUNT(*) as post_count
        FROM posts 
        WHERE published = true
        GROUP BY category 
        ORDER BY post_count DESC
      `;
      
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get popular posts
  static async getPopular(limit = 5) {
    try {
      const sql = `
        SELECT * FROM posts 
        WHERE published = true
        ORDER BY views DESC, created_at DESC 
        LIMIT $1
      `;
      
      const result = await query(sql, [limit]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Post;