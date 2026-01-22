const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function deleteDuplicates() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🗑️  DELETING DUPLICATE POSTS - FINAL CONFIRMATION');
    console.log('='.repeat(80) + '\n');

    console.log('This action will:');
    console.log(`  • Delete ${postsToDelete.length} duplicate/low-value posts`);
    console.log('  • Keep 9 unique high-quality posts');
    console.log('  • Improve your site for Google AdSense approval\n');

    const confirmed = await askConfirmation('Type "yes" to proceed with deletion: ');

    if (!confirmed) {
      console.log('\n❌ Deletion cancelled. No changes made.\n');
      client.release();
      pool.end();
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    console.log('\n⏳ Deleting posts...\n');

    // Delete all posts with titles in the list
    const deleteResult = await client.query(
      `DELETE FROM posts WHERE title = ANY($1)`,
      [postsToDelete]
    );

    console.log(`✅ Deleted ${deleteResult.rowCount} posts\n`);

    // Show remaining posts
    const remaining = await client.query(
      `SELECT id, title, category, published 
       FROM posts 
       ORDER BY category, created_at DESC`
    );

    console.log(`📊 Remaining posts: ${remaining.rows.length}\n`);
    console.log('Posts kept for improvement:\n');
    
    remaining.rows.forEach((post, idx) => {
      console.log(`${idx + 1}. "${post.title}"`);
      console.log(`   Category: ${post.category} | Published: ${post.published ? 'Yes' : 'No'}\n`);
    });

    // Commit transaction
    await client.query('COMMIT');

    console.log('='.repeat(80));
    console.log('✅ DUPLICATE POSTS SUCCESSFULLY DELETED!');
    console.log('='.repeat(80) + '\n');

    console.log('📝 NEXT STEPS:\n');
    console.log('1. Each remaining post needs to be rewritten with:');
    console.log('   • Original research or personal experience');
    console.log('   • Specific examples with real numbers');
    console.log('   • Unique angle or methodology');
    console.log('   • Clear problem-solving focus\n');

    console.log('2. Run this to get detailed rewrite instructions:');
    console.log('   node get-rewrite-instructions.js\n');

    console.log('3. After rewriting all 9 posts, request Google AdSense review\n');

    console.log('='.repeat(80) + '\n');

    client.release();
    pool.end();
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
    client.release();
    pool.end();
  }
}

deleteDuplicates();
