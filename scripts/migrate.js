require('dotenv').config();
const { query, pool } = require('../config/database');
const User = require('../models/User');
const Post = require('../models/Post');
const Analytics = require('../backend/models/Analytics');

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Test connection first
    console.log('📡 Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connected at:', testResult.rows[0].now);
    
    // Create tables
    console.log('\n📋 Creating tables...');
    await User.createTable();
    await Post.createTable();
    await Analytics.createTable();
    
    // Create admin user
    console.log('\n👤 Setting up admin user...');
    await User.createAdminUser();
    
    // Create sample posts
    console.log('\n📝 Creating sample posts...');
    
    const samplePosts = [
      {
        title: '10 Smart Ways to Save Money in 2025',
        category: 'Saving Tips',
        excerpt: 'Discover practical money-saving strategies that actually work in today\'s economy.',
        content: `<h2>Introduction</h2>
<p>Saving money doesn't have to mean sacrificing your lifestyle. With the right strategies, you can build wealth while still enjoying life.</p>

<h2>1. Automate Your Savings</h2>
<p>Set up automatic transfers from your checking to savings account. Even $50 per paycheck adds up to over $1,200 per year!</p>

<h2>2. Use Cashback Apps</h2>
<p>Apps like Rakuten and Honey can save you hundreds annually on purchases you're already making.</p>

<h2>3. Cut Subscription Bloat</h2>
<p>Review all your monthly subscriptions. Cancel services you don't actively use.</p>

<h2>4. Cook at Home More</h2>
<p>Eating out less can save the average person $200-300 per month.</p>

<h2>5. Negotiate Bills</h2>
<p>Call your internet, phone, and insurance providers to negotiate better rates.</p>

<h2>Conclusion</h2>
<p>Small changes add up to big savings over time!</p>`
      },
      {
        title: 'Beginner\'s Guide to Stock Market Investing',
        category: 'Investing',
        excerpt: 'Learn how to start investing in stocks with minimal risk and maximum potential.',
        content: `<h2>Getting Started with Investing</h2>
<p>Investing can seem intimidating, but it's essential for building long-term wealth.</p>

<h2>Understanding the Basics</h2>
<p>A stock represents ownership in a company. When you buy stocks, you become a shareholder.</p>

<h2>Start with Index Funds</h2>
<p>Index funds like the S&P 500 offer diversification and lower risk for beginners.</p>

<h2>Dollar-Cost Averaging</h2>
<p>Invest a fixed amount regularly, regardless of market conditions.</p>

<h2>Long-Term Mindset</h2>
<p>The stock market rewards patience. Think in decades, not days.</p>`
      },
      {
        title: 'Creating a Budget That Actually Works',
        category: 'Budgeting',
        excerpt: 'Step-by-step guide to building and sticking to a realistic budget.',
        content: `<h2>Why Budgeting Matters</h2>
<p>A budget is simply a plan for your money. It helps you control spending and reach goals faster.</p>

<h2>The 50/30/20 Rule</h2>
<p>Allocate 50% to needs, 30% to wants, and 20% to savings and debt repayment.</p>

<h2>Track Your Spending</h2>
<p>Use apps like Mint or YNAB to automatically categorize expenses.</p>

<h2>Review Monthly</h2>
<p>Adjust your budget based on actual spending patterns.</p>`
      }
    ];
    
    for (const post of samplePosts) {
      try {
        await Post.create({
          ...post,
          author_id: 1,
          published: true,
          meta_description: post.excerpt.substring(0, 160)
        });
        console.log(`✅ Created post: ${post.title}`);
      } catch (err) {
        console.log(`⚠️  Post may already exist: ${post.title}`);
      }
    }
    
    console.log('\n✅ Database migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log('   ✅ Users table created');
    console.log('   ✅ Posts table created');
    console.log('   ✅ Analytics tables created');
    console.log('   ✅ Admin user created');
    console.log('   ✅ Sample posts added');
    console.log('\n🔐 Admin Login:');
    console.log('   Email: admin@smartmoneyguide.com');
    console.log('   Password: Admin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

migrate();
