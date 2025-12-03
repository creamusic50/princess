require('dotenv').config();
const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database with sample data...');
  
  try {
    // Create more categories
    await query(`
      INSERT INTO posts (title, slug, category, excerpt, content, author_id, published, views) 
      VALUES 
      (
        'How to Create a Budget That Actually Works', 
        'how-to-create-budget-that-actually-works-${Date.now().toString().slice(-6)}',
        'Budgeting',
        'Learn the step-by-step process to create a budget you can stick to.',
        '<h2>Why Budgeting Matters</h2><p>A budget is your financial roadmap...</p><h2>Step 1: Calculate Your Income</h2><p>Start by listing all your income sources...</p>',
        1,
        true,
        150
      ),
      (
        'Retirement Planning for Millennials',
        'retirement-planning-for-millennials-${Date.now().toString().slice(-6)}',
        'Retirement',
        'Start planning for retirement now, no matter your age.',
        '<h2>Why Start Early?</h2><p>Compound interest works best with time...</p>',
        1,
        true,
        89
      ),
      (
        'Credit Card Rewards: Maximize Your Benefits',
        'credit-card-rewards-maximize-benefits-${Date.now().toString().slice(-6)}',
        'Credit Cards',
        'Learn how to earn thousands in rewards each year.',
        '<h2>Understanding Credit Card Rewards</h2><p>Different cards offer different benefits...</p>',
        1,
        true,
        120
      ),
      (
        'Emergency Fund: Why You Need It Now',
        'emergency-fund-why-you-need-it-now-${Date.now().toString().slice(-6)}',
        'Money Management',
        'Protect yourself from financial emergencies.',
        '<h2>The Importance of Emergency Funds</h2><p>Life is unpredictable...</p>',
        1,
        true,
        75
      )
      ON CONFLICT (slug) DO NOTHING
    `);
    
    // Create regular user
    const hashedPassword = await bcrypt.hash('User123!', 10);
    await query(`
      INSERT INTO users (username, email, password, role) 
      VALUES ('testuser', 'user@smartmoneyguide.com', $1, 'user')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    
    console.log('✅ Sample data seeded successfully!');
    console.log('👤 Test User: user@smartmoneyguide.com / User123!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();