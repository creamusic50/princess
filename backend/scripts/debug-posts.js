const { query } = require('./config/database');

async function debugPosts() {
    console.log('🔍 DEBUG: Testing Posts API');
    console.log('=' .repeat(50));
    
    try {
        // Test 1: Database connection
        console.log('\n✅ Test 1: Database Connection');
        const connectionTest = await query('SELECT NOW()');
        console.log('   Connected at:', connectionTest.rows[0].now);
        
        // Test 2: Check if posts table exists
        console.log('\n✅ Test 2: Posts Table Check');
        const tableCheck = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'posts'
            );
        `);
        console.log('   Posts table exists:', tableCheck.rows[0].exists);
        
        if (!tableCheck.rows[0].exists) {
            console.log('   ❌ ERROR: Posts table does not exist!');
            console.log('   Run: npm run init-db');
            return;
        }
        
        // Test 3: Count posts
        console.log('\n✅ Test 3: Count Posts');
        const countResult = await query('SELECT COUNT(*) as count FROM posts');
        const postCount = countResult.rows[0].count;
        console.log('   Total posts in database:', postCount);
        
        if (postCount === '0') {
            console.log('   ⚠️  No posts found in database!');
            console.log('   You need to create posts via admin panel');
        }
        
        // Test 4: Get published posts
        console.log('\n✅ Test 4: Get Published Posts');
        const publishedResult = await query('SELECT COUNT(*) as count FROM posts WHERE published = true');
        console.log('   Published posts:', publishedResult.rows[0].count);
        
        // Test 5: Get sample posts
        console.log('\n✅ Test 5: Get Sample Posts');
        const samplePosts = await query('SELECT id, title, slug, published, created_at FROM posts LIMIT 5');
        if (samplePosts.rows.length > 0) {
            console.log('   Sample posts:');
            samplePosts.rows.forEach(post => {
                console.log(`   - [${post.published ? '✓' : '✗'}] ${post.title} (${post.slug})`);
            });
        } else {
            console.log('   No posts to display');
        }
        
        // Test 6: Check for users table
        console.log('\n✅ Test 6: Users Table Check');
        const usersCheck = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);
        console.log('   Users table exists:', usersCheck.rows[0].exists);
        
        if (usersCheck.rows[0].exists) {
            const userCount = await query('SELECT COUNT(*) as count FROM users');
            console.log('   Total users:', userCount.rows[0].count);
        }
        
        // Test 7: Test API endpoint simulation
        console.log('\n✅ Test 7: Simulate API Query');
        const Post = require('./models/Post');
        const result = await Post.getAll({
            page: 1,
            limit: 9,
            published: true
        });
        
        console.log('   API Result:');
        console.log('   - Posts returned:', result.posts.length);
        console.log('   - Total posts:', result.total);
        console.log('   - Total pages:', result.totalPages);
        console.log('   - Current page:', result.currentPage);
        
        if (result.posts.length > 0) {
            console.log('\n   First post preview:');
            const firstPost = result.posts[0];
            console.log('   - Title:', firstPost.title);
            console.log('   - Slug:', firstPost.slug);
            console.log('   - Category:', firstPost.category);
            console.log('   - Published:', firstPost.published);
            console.log('   - Views:', firstPost.views);
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests completed!');
        
        if (postCount === '0') {
            console.log('\n📝 SOLUTION: Create posts in admin panel');
            console.log('   1. Start server: npm start');
            console.log('   2. Go to: http://localhost:5000/admin.html');
            console.log('   3. Login with admin credentials');
            console.log('   4. Create new posts');
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('   Stack:', error.stack);
    } finally {
        process.exit(0);
    }
}

debugPosts();
