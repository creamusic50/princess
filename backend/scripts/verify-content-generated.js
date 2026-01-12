const Pool = require('pg').Pool;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function verifyContent() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
        const result = await pool.query(
            'SELECT id, title, category, LENGTH(content) as content_length FROM posts ORDER BY id LIMIT 5'
        );
        
        console.log('\n✅ Sample of updated posts:\n');
        result.rows.forEach(row => {
            const wordCount = Math.round(row.content_length / 5); // Average word length
            console.log(`📄 ${row.title}`);
            console.log(`   Category: ${row.category}`);
            console.log(`   Content chars: ${row.content_length} (~${wordCount} words)\n`);
        });
        
        const countResult = await pool.query('SELECT COUNT(*) as total FROM posts WHERE content IS NOT NULL AND LENGTH(content) > 500');
        console.log(`\n📊 Total posts with content (>500 chars): ${countResult.rows[0].total}/27\n`);
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

verifyContent();
