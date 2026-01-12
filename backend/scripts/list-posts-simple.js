const Pool = require('pg').Pool;
const dotenv = require('dotenv');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function listPosts() {
    try {
        const result = await pool.query('SELECT id, title, category, excerpt, created_at FROM posts ORDER BY created_at DESC');
        console.log(`\n📝 Total Posts: ${result.rows.length}\n`);
        result.rows.forEach((post, i) => {
            console.log(`${i + 1}. "${post.title}"`);
            console.log(`   Category: ${post.category}`);
            console.log(`   Excerpt: ${post.excerpt ? post.excerpt.substring(0, 60) + '...' : 'N/A'}`);
            console.log('');
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        pool.end();
    }
}

listPosts();
