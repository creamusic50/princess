#!/usr/bin/env node

/**
 * Posts Loading Debug & Fix Script
 * This script diagnoses and fixes common issues with posts not loading
 */

const { query, pool } = require('./config/database');
const Post = require('./models/Post');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
    console.log(`${color}${message}${RESET}`);
}

async function checkDatabase() {
    log('\n📊 Step 1: Checking Database Connection...', BLUE);
    try {
        const result = await query('SELECT NOW(), current_database()');
        log(`✅ Connected to: ${result.rows[0].current_database}`, GREEN);
        log(`✅ Server time: ${result.rows[0].now}`, GREEN);
        return true;
    } catch (error) {
        log(`❌ Database connection failed: ${error.message}`, RED);
        log('\n💡 Fix: Check your DATABASE_URL in .env file', YELLOW);
        return false;
    }
}

async function checkTables() {
    log('\n📋 Step 2: Checking Required Tables...', BLUE);
    try {
        const tables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('posts', 'users', 'categories')
        `);
        
        const tableNames = tables.rows.map(r => r.table_name);
        
        if (tableNames.includes('posts')) {
            log('✅ Posts table exists', GREEN);
        } else {
            log('❌ Posts table missing!', RED);
            log('💡 Fix: Run "npm run init-db"', YELLOW);
            return false;
        }
        
        if (tableNames.includes('users')) {
            log('✅ Users table exists', GREEN);
        } else {
            log('⚠️  Users table missing (optional)', YELLOW);
        }
        
        return true;
    } catch (error) {
        log(`❌ Error checking tables: ${error.message}`, RED);
        return false;
    }
}

async function checkPostsData() {
    log('\n📝 Step 3: Checking Posts Data...', BLUE);
    try {
        // Count total posts
        const total = await query('SELECT COUNT(*) as count FROM posts');
        const totalCount = parseInt(total.rows[0].count);
        log(`📊 Total posts: ${totalCount}`, totalCount > 0 ? GREEN : YELLOW);
        
        // Count published posts
        const published = await query('SELECT COUNT(*) as count FROM posts WHERE published = true');
        const publishedCount = parseInt(published.rows[0].count);
        log(`✅ Published posts: ${publishedCount}`, publishedCount > 0 ? GREEN : RED);
        
        if (publishedCount === 0) {
            log('\n❌ NO PUBLISHED POSTS FOUND!', RED);
            log('💡 This is why posts aren\'t loading on the frontend', YELLOW);
            log('💡 Fixes:', YELLOW);
            log('   1. Create posts via admin panel: http://localhost:5000/admin.html', YELLOW);
            log('   2. Or publish existing drafts', YELLOW);
            
            // Check if there are drafts
            if (totalCount > 0) {
                const drafts = await query('SELECT id, title FROM posts WHERE published = false LIMIT 5');
                if (drafts.rows.length > 0) {
                    log('\n📄 Found drafts (you can publish these):', BLUE);
                    drafts.rows.forEach(draft => {
                        log(`   - "${draft.title}" (ID: ${draft.id})`, BLUE);
                    });
                }
            }
            
            return false;
        }
        
        // Show sample posts
        const samples = await query(`
            SELECT id, title, slug, category, published, views, created_at 
            FROM posts 
            WHERE published = true
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        if (samples.rows.length > 0) {
            log('\n📚 Sample published posts:', GREEN);
            samples.rows.forEach((post, idx) => {
                log(`   ${idx + 1}. "${post.title}"`, GREEN);
                log(`      - Category: ${post.category}`, RESET);
                log(`      - Slug: ${post.slug}`, RESET);
                log(`      - Views: ${post.views}`, RESET);
                log(`      - Date: ${new Date(post.created_at).toLocaleDateString()}`, RESET);
            });
        }
        
        return true;
    } catch (error) {
        log(`❌ Error checking posts: ${error.message}`, RED);
        return false;
    }
}

async function testAPIQuery() {
    log('\n🔌 Step 4: Testing API Query Logic...', BLUE);
    try {
        const result = await Post.getAll({
            page: 1,
            limit: 9,
            published: true
        });
        
        log(`✅ API Query successful`, GREEN);
        log(`   - Posts returned: ${result.posts.length}`, GREEN);
        log(`   - Total: ${result.total}`, GREEN);
        log(`   - Pages: ${result.totalPages}`, GREEN);
        log(`   - Current page: ${result.currentPage}`, GREEN);
        
        if (result.posts.length === 0) {
            log('\n⚠️  API returned 0 posts', YELLOW);
            log('   This means the frontend will show "No posts found"', YELLOW);
        } else {
            log('\n✅ Posts are being returned correctly!', GREEN);
            log('   First post:', BLUE);
            const first = result.posts[0];
            log(`   - Title: ${first.title}`, RESET);
            log(`   - Category: ${first.category}`, RESET);
            log(`   - Excerpt: ${first.excerpt?.substring(0, 100)}...`, RESET);
        }
        
        return result.posts.length > 0;
    } catch (error) {
        log(`❌ API query failed: ${error.message}`, RED);
        log(`   Stack: ${error.stack}`, RED);
        return false;
    }
}

async function checkCORS() {
    log('\n🌐 Step 5: Checking CORS Configuration...', BLUE);
    
    const envPath = require('path').join(__dirname, '.env');
    const fs = require('fs');
    
    if (fs.existsSync(envPath)) {
        const env = fs.readFileSync(envPath, 'utf8');
        
        if (env.includes('CORS_ORIGIN')) {
            log('✅ CORS_ORIGIN is configured', GREEN);
        } else {
            log('⚠️  CORS_ORIGIN not found in .env', YELLOW);
            log('   This might cause API issues', YELLOW);
        }
        
        if (env.includes('DATABASE_URL') && !env.includes('DATABASE_URL=postgresql://user:password')) {
            log('✅ DATABASE_URL is set', GREEN);
        } else {
            log('❌ DATABASE_URL not properly configured!', RED);
        }
    } else {
        log('❌ .env file not found!', RED);
        return false;
    }
    
    return true;
}

async function provideSolutions() {
    log('\n' + '='.repeat(60), BLUE);
    log('📋 DIAGNOSTIC SUMMARY & SOLUTIONS', BLUE);
    log('='.repeat(60), BLUE);
    
    // Run checks
    const dbOk = await checkDatabase();
    if (!dbOk) {
        log('\n❌ CRITICAL: Database connection failed', RED);
        log('   1. Check your DATABASE_URL in .env', YELLOW);
        log('   2. Make sure PostgreSQL is running', YELLOW);
        log('   3. Verify credentials are correct', YELLOW);
        return;
    }
    
    const tablesOk = await checkTables();
    if (!tablesOk) {
        log('\n❌ CRITICAL: Required tables missing', RED);
        log('   Run: npm run init-db', YELLOW);
        return;
    }
    
    const postsOk = await checkPostsData();
    const apiOk = await testAPIQuery();
    await checkCORS();
    
    log('\n' + '='.repeat(60), BLUE);
    
    if (postsOk && apiOk) {
        log('✅ EVERYTHING IS WORKING!', GREEN);
        log('   Your posts should load correctly', GREEN);
        log('\n   Test your site:', BLUE);
        log('   1. Start server: npm start', YELLOW);
        log('   2. Open: http://localhost:5000', YELLOW);
        log('   3. Posts should appear on homepage', YELLOW);
    } else {
        log('❌ ISSUES FOUND - FOLLOW THESE STEPS:', RED);
        log('\n   QUICK FIX:', YELLOW);
        log('   1. Start your server: npm start', YELLOW);
        log('   2. Open admin panel: http://localhost:5000/admin.html', YELLOW);
        log('   3. Login with admin credentials', YELLOW);
        log('   4. Create and PUBLISH at least 1 post', YELLOW);
        log('   5. Return to homepage: http://localhost:5000', YELLOW);
        log('   6. Posts should now appear!', YELLOW);
        
        if (!postsOk) {
            log('\n   ⚠️  No published posts found!', RED);
            log('   This is the main reason posts aren\'t loading', RED);
        }
    }
    
    log('\n' + '='.repeat(60), BLUE);
}

// Run the diagnostics
provideSolutions()
    .then(() => {
        log('\n✅ Diagnostic complete!', GREEN);
        process.exit(0);
    })
    .catch((error) => {
        log(`\n❌ Unexpected error: ${error.message}`, RED);
        console.error(error);
        process.exit(1);
    });
