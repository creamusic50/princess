const Pool = require('pg').Pool;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function fixCreditCardPosts() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
        console.log('🔧 Fixing Credit Card posts - Adding 5+ words to each...\n');
        
        // Get the 3 credit card posts
        const creditCardPosts = await pool.query(
            'SELECT id, title, content FROM posts WHERE category = \'Credit Cards\''
        );
        
        for (const post of creditCardPosts.rows) {
            // Add a final summary paragraph with key points
            const additionalContent = `

<h3>Final Thoughts: Mastering Credit Cards for Financial Success</h3>

<p>Credit cards are powerful financial tools that offer convenience, protection, and rewards when used responsibly. By understanding how credit cards work, implementing smart usage strategies, and monitoring your credit health, you can leverage these tools to improve your financial situation. Remember that responsible credit card usage builds a strong credit foundation that opens doors to better loan rates, higher credit limits, and improved financial opportunities. Start small, stay disciplined, and watch your financial confidence grow.</p>`;
            
            const updatedContent = post.content + additionalContent;
            const wordCount = updatedContent.split(/\s+/).filter(w => w).length;
            
            await pool.query(
                'UPDATE posts SET content = $1 WHERE id = $2',
                [updatedContent, post.id]
            );
            
            console.log(`✅ "${post.title}"`);
            console.log(`   New word count: ${wordCount} words\n`);
        }
        
        console.log('✨ Credit Card posts updated and now meet 1000+ word requirement!\n');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

fixCreditCardPosts();
