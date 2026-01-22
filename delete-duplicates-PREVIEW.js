const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Posts to DELETE (near-duplicates)
const postsToDelete = [
  "Creating a Budget That Actually Works",
  "Common Budgeting Mistakes That Keep People Poor (And How to Fix Them)",
  "How to Create a Simple Budget That Actually Works for Beginners",
  "How to Save Money on a Low Income: Practical Budgeting Tips That Work",
  
  "Credit Cards for Beginners: How to Build Credit and Avoid Debt",
  "How to Use Credit Cards Wisely: A Beginner's Guide",
  
  "Beginner's Guide to Stock Market Investing",
  "Beginner's Guide to Investing: How to Start Building Wealth Safely",
  "Common Investment Mistakes Beginners Must Avoid to Protect Their Money",
  "Smart Investment Strategies for Beginners: Build Wealth Safely and Consistently",
  
  "Advanced Money Management: Techniques to Save, Invest, and Secure Your Financial Future",
  "Comprehensive Money Management: Strategies to Save, Invest, and Build Wealth",
  "Smart Strategies for Managing Your Money: Budgeting, Saving, and Investing",
  
  "Retirement Planning for Beginners: How to Secure Your Future in Your 30s and 40s",
  "Top Retirement Planning Mistakes to Avoid and How to Correct Them",
  
  "How to Manage Money Wisely and Build a Strong Financial Future",
  "How to Save Money Smartly in 2025: Practical Tips to Build a Better Financial Future",
  "Smart Money Saving Tips for Everyday People: How to Save More Without Struggling"
];

// Posts to KEEP (high-value unique posts)
const postsToKeep = [
  "50-30-20 Budget Rule Explained: How to Manage Your Money Wisely",
  "Mastering Credit Cards: Advanced Tips for Responsible Usage and Financial Growth",
  "Stocks vs Bonds vs Real Estate: Which Investment Is Best for Beginners?",
  "How to Start Investing With Little Money: A Beginner's Step-by-Step Guide",
  "Ultimate Guide to Money Management: How to Save, Invest, and Grow Your Wealth",
  "How to Start Planning for Retirement in Your 20s and 30s",
  "Essential Retirement Planning Tips for Late Starters: How to Catch Up and Secure Your Future",
  "10 Smart Ways to Save Money in 2025",
  "Best Saving Habits That Help You Build Wealth and Secure Your Future"
];

async function backupAndDelete() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🗑️  DELETE DUPLICATE POSTS - ADSENSE FIX');
    console.log('='.repeat(80) + '\n');

    // First, get all posts to delete and backup
    console.log('📋 Fetching posts to delete for backup...\n');
    
    const result = await client.query(
      `SELECT id, title, category, content, excerpt, published, created_at 
       FROM posts 
       WHERE title = ANY($1)
       ORDER BY category, title`,
      [postsToDelete]
    );

    const postsData = result.rows;
    console.log(`Found ${postsData.length} posts to delete\n`);

    if (postsData.length !== postsToDelete.length) {
      console.log('⚠️  Warning: Not all posts found for deletion!');
      console.log(`Expected: ${postsToDelete.length}, Found: ${postsData.length}\n`);
    }

    // Create backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(__dirname, `backup_deleted_posts_${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      backupReason: 'Deleted duplicate posts for AdSense improvement',
      totalDeleted: postsData.length,
      posts: postsData
    }, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}\n`);

    // Show what will be deleted
    console.log('📝 POSTS TO BE DELETED:\n');
    postsData.forEach((post, idx) => {
      console.log(`${idx + 1}. "${post.title}"`);
      console.log(`   Category: ${post.category} | ID: ${post.id} | Published: ${post.published}`);
      console.log(`   Words: ~${Math.round((post.content || '').split(/\s+/).length)}`);
      console.log('');
    });

    // Confirm deletion
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  CONFIRMATION REQUIRED');
    console.log('='.repeat(80));
    console.log('\nAbout to DELETE 18 posts from database.');
    console.log('A backup has been saved (you can restore manually if needed).\n');
    console.log('Posts to KEEP (9 high-quality posts):');
    postsToKeep.forEach((title, idx) => {
      console.log(`  ${idx + 1}. ${title}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('To DELETE these duplicate posts, run:');
    console.log('\n  node delete-duplicates-CONFIRM.js\n');
    console.log('(This requires separate confirmation to prevent accidental deletion)\n');
    console.log('='.repeat(80) + '\n');

    client.release();
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    client.release();
    pool.end();
  }
}

backupAndDelete();
