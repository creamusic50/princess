const Pool = require('pg').Pool;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function publishAllPosts() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
        console.log('🚀 Publishing all posts...\n');
        
        const result = await pool.query(
            'UPDATE posts SET published = true WHERE published = false RETURNING id, title'
        );
        
        if (result.rows.length === 0) {
            console.log('ℹ️  All posts are already published!');
            
            // Show all published posts
            const allPosts = await pool.query(
                'SELECT COUNT(*) as total FROM posts WHERE published = true'
            );
            console.log(`\n✅ Total published posts: ${allPosts.rows[0].total}\n`);
        } else {
            console.log(`✅ Successfully published ${result.rows.length} posts:\n`);
            result.rows.forEach((post, i) => {
                console.log(`   ${i + 1}. ${post.title}`);
            });
            
            console.log(`\n✨ All ${result.rows.length} posts are now live!\n`);
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

publishAllPosts();
