const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function exportPosts() {
  try {
    const result = await pool.query(`
      SELECT id, title, category, content, excerpt
      FROM posts
      ORDER BY category, title
    `);

    console.log(`\n📄 EXPORTING ${result.rows.length} POSTS FOR REWRITING\n`);

    result.rows.forEach((post, idx) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`${idx + 1}. ${post.title}`);
      console.log(`Category: ${post.category} | ID: ${post.id}`);
      console.log('='.repeat(80));
      console.log('\nCURRENT CONTENT (First 500 chars):');
      console.log(post.content.substring(0, 500) + '...\n');
      console.log(`Full length: ${post.content.length} chars`);
    });

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
  }
}

exportPosts();
