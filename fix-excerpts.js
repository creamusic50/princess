require('dotenv').config();
const { query } = require('./config/database');

async function fixExcerpts() {
  try {
    const excerpts = {
      'creating-a-budget-that-actually-works-300258': 'A budget is a financial plan that outlines your income and expenses. It\'s one of the most important tools you can use to manage your money effectively and take control of your financial future. Whether you\'re just starting out with your first job, recovering from financial difficulties, or looking to improve your current financial situation, creating a budget that actually works is absolutely essential for long-term success.',
      'beginners-guide-to-stock-market-investing-298310': 'The stock market can seem intimidating and overwhelming to beginners, but investing is one of the most powerful and proven ways to build long-term wealth over time. This comprehensive guide will walk you through the fundamentals of stock market investing and help you get started on your wealth-building journey with confidence and the right knowledge.',
      '10-smart-ways-to-save-money-in-2025-297798': 'Saving money is one of the most important financial habits you can develop, yet it\'s often neglected in our consumer-driven society. In 2025, here are 10 smart, actionable ways to save more money and build genuine financial security for yourself and your family. Start implementing these strategies today to accelerate your path to financial freedom and wealth building.'
    };

    for (const [slug, excerpt] of Object.entries(excerpts)) {
      await query(
        'UPDATE posts SET excerpt = $1, updated_at = NOW() WHERE slug = $2',
        [excerpt, slug]
      );
      console.log(`✅ Updated excerpt for ${slug.substring(0, 30)}...`);
    }

    console.log('\n✅ All excerpts fixed!');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

fixExcerpts();
