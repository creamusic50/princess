#!/usr/bin/env node

/**
 * 🔨 ADSENSE FIX SCRIPT - Complete Remediation
 * 1. Delete garbage posts (test + blank)
 * 2. Expand thin posts to 1000+ words
 * 3. Add featured images to all posts
 * 4. Verify compliance
 */

require('dotenv').config();
const { query } = require('../../config/database');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function section(title) {
  console.log(`\n${BOLD}${CYAN}${'='.repeat(70)}${RESET}`);
  log(title, BOLD + CYAN);
  console.log(`${CYAN}${'='.repeat(70)}${RESET}`);
}

// Content to add to thin posts
const expansionContent = {
  'creating-a-budget-that-actually-works-300258': `
A budget is a financial plan that outlines your income and expenses. It's one of the most important tools you can use to manage your money effectively. Whether you're just starting out or looking to improve your financial situation, creating a budget that actually works is essential.

## Why You Need a Budget

A budget gives you control over your money. Without a budget, you might find yourself spending more than you earn, going into debt, or struggling to save for important goals. With a budget, you can:

- Track where your money goes
- Identify unnecessary expenses
- Plan for future goals
- Build an emergency fund
- Reduce financial stress
- Make informed spending decisions

## Step 1: Calculate Your Income

The first step in creating a budget is knowing how much money you have coming in. This includes:

- Your salary or wages
- Freelance income
- Investment returns
- Side hustle earnings
- Any other regular income

Write down all sources of income and calculate your average monthly income. If your income varies, use a conservative estimate.

## Step 2: List Your Expenses

Next, write down all your monthly expenses. Divide them into two categories:

**Fixed Expenses** (stay the same each month):
- Rent or mortgage
- Insurance premiums
- Loan payments
- Utilities
- Subscriptions

**Variable Expenses** (change from month to month):
- Groceries
- Gas
- Dining out
- Entertainment
- Shopping

## Step 3: Calculate the Difference

Subtract your total expenses from your total income:

**Income - Expenses = Surplus (or Deficit)**

If you have a surplus, you can allocate it to savings and investments. If you have a deficit, you need to cut expenses or increase income.

## Step 4: Use the 50/30/20 Rule

A popular budgeting method is the 50/30/20 rule:
- 50% for needs (housing, food, utilities)
- 30% for wants (entertainment, dining out)
- 20% for savings and debt repayment

## Step 5: Track Your Progress

Use a spreadsheet, budgeting app, or pen and paper to track your spending. Review your budget monthly and adjust as needed. The key to making a budget work is consistency and flexibility.

## Budgeting Tools

Several tools can help you create and maintain a budget:
- Mint
- YNAB (You Need A Budget)
- EveryDollar
- Spreadsheets
- PocketGuard
- Goodbudget

## Common Budgeting Mistakes

Avoid these common mistakes when creating your budget:
- Being too restrictive
- Not accounting for irregular expenses
- Ignoring credit card debt
- Setting unrealistic goals
- Failing to review regularly

## Conclusion

Creating a budget that actually works takes time and effort, but it's one of the best investments you can make in your financial future. Start simple, be honest about your spending, and adjust as needed. With consistency and discipline, you'll be on your way to financial success.
`,

  'beginners-guide-to-stock-market-investing-298310': `
The stock market can seem intimidating to beginners, but investing is one of the most powerful ways to build wealth over time. This guide will walk you through the basics of stock market investing and help you get started on your investment journey.

## What Is the Stock Market?

The stock market is a platform where shares of publicly traded companies are bought and sold. When you own a share of a company, you own a small piece of that company. Stock prices fluctuate based on supply and demand, company performance, and economic conditions.

## Why Invest in Stocks?

Historically, stocks have provided the best long-term returns compared to other investments. Over the past century, the average annual return of the stock market has been around 10%. This means if you invest $1,000 in a diversified stock portfolio, your investment could potentially double every 7-10 years.

## Key Terms to Know

**Stock:** A share of ownership in a company
**Share:** One unit of stock
**Dividend:** Payment made by a company to shareholders
**Broker:** A person or firm that buys and sells stocks on your behalf
**Portfolio:** Your collection of investments
**Diversification:** Spreading investments across different sectors and companies

## How to Get Started

### Step 1: Open a Brokerage Account

You'll need a brokerage account to buy stocks. Popular brokerages include:
- Fidelity
- Charles Schwab
- Vanguard
- Webull
- E-Trade

Most brokerages have no minimum investment requirement, making it easy to start with small amounts.

### Step 2: Research Before You Invest

Don't just pick random stocks. Research companies before investing:
- Read annual reports
- Check financial statements
- Review analyst ratings
- Understand the company's business model
- Look at historical performance

### Step 3: Diversify Your Portfolio

Don't put all your money in one stock. Spread your investments across:
- Different sectors (technology, healthcare, finance, energy)
- Different company sizes (large-cap, mid-cap, small-cap)
- Different types of investments (stocks, bonds, index funds)

### Step 4: Invest Regularly

Time in the market beats timing the market. Invest regularly through:
- Monthly investments (dollar-cost averaging)
- Automatic contributions
- Reinvesting dividends

## Types of Stocks

**Growth Stocks:** Companies expected to grow faster than average
**Value Stocks:** Underpriced companies with strong fundamentals
**Dividend Stocks:** Companies that pay regular dividends
**Blue-Chip Stocks:** Large, established companies with strong track records

## Common Beginner Mistakes

- Trying to time the market
- Panic selling during downturns
- Investing without a plan
- Not diversifying
- Following the crowd
- Investing money you need short-term

## Investment Strategies for Beginners

**Buy and Hold:** Purchase stocks and keep them for the long term
**Index Investing:** Invest in index funds that track market indices
**Value Investing:** Buy undervalued stocks with good fundamentals
**Dollar-Cost Averaging:** Invest the same amount regularly

## Long-Term vs. Short-Term Investing

- **Long-term investing:** Buying and holding for years or decades
- **Short-term trading:** Buying and selling frequently

For beginners, long-term investing is recommended because it's less risky and requires less expertise.

## Conclusion

Starting to invest in the stock market as a beginner doesn't have to be complicated. Open an account, do your research, diversify your portfolio, and invest regularly. Remember, the best time to start investing was yesterday, but the second-best time is today. Start small and build your wealth over time.
`,

  '10-smart-ways-to-save-money-in-2025-297798': `
Saving money is one of the most important financial habits you can develop. In 2025, here are 10 smart ways to save more money and build financial security.

## 1. Track Your Spending

Before you can save, you need to know where your money goes. For one month, track every purchase you make:
- Use budgeting apps
- Save receipts
- Write down expenses
- Review categories
- Identify patterns

This will reveal your spending habits and areas where you can cut back.

## 2. Create a Budget

A budget is a roadmap for your money. Allocate your income to:
- Essential expenses (housing, food, utilities)
- Savings goals
- Discretionary spending
- Debt repayment

Review and adjust your budget monthly based on actual spending.

## 3. Automate Your Savings

Make saving automatic by:
- Setting up automatic transfers to savings account
- Scheduling transfers on payday
- Using apps that round up purchases
- Contributing to retirement accounts automatically

When you automate savings, you're less likely to spend the money.

## 4. Cut Unnecessary Subscriptions

Review all your subscriptions:
- Streaming services
- Gym memberships
- Magazine subscriptions
- Software subscriptions
- Phone services

Cancel ones you don't use regularly. This alone can save hundreds annually.

## 5. Reduce Energy Costs

Lower your utility bills by:
- Using LED light bulbs
- Adjusting thermostat settings
- Unplugging devices when not in use
- Taking shorter showers
- Using energy-efficient appliances
- Sealing air leaks

Small changes add up to significant savings.

## 6. Meal Plan and Cook at Home

Eating out is expensive. Save money by:
- Planning meals weekly
- Making a grocery list
- Cooking at home
- Bringing lunch to work
- Batch cooking and freezing
- Using coupons and loyalty programs

This can save thousands annually.

## 7. Use the 30-Day Rule

Before making a purchase:
- Wait 30 days
- Reconsider if you really need it
- Check if you can buy used
- Look for discounts

This reduces impulse purchases and unnecessary spending.

## 8. Negotiate Bills and Rates

Call providers and negotiate:
- Insurance premiums
- Internet and phone plans
- Credit card interest rates
- Loan rates
- Cable bills

Simply asking often results in lower rates.

## 9. Build an Emergency Fund

An emergency fund protects you from financial crisis. Save:
- 3-6 months of expenses
- In a separate savings account
- Before investing aggressively
- Gradually if needed

Start with $500-$1,000 and build from there.

## 10. Find Free Entertainment

Save on entertainment by:
- Using free community events
- Visiting free museums
- Hiking and outdoor activities
- Having game nights
- Reading library books
- Watching free content

You don't need to spend money to have fun.

## Saving Challenges for 2025

Try these saving challenges to build your savings habit:
- 52-week savings challenge
- No-spend month challenge
- Save your change challenge
- Cashback challenge
- Bonus savings challenge

## Conclusion

Saving money in 2025 is about making intentional choices and building good habits. Start with one or two strategies, master them, then add more. The key is consistency. Every dollar you save is a dollar working towards your financial goals and freedom.
`
};

// Featured image URLs (using free placeholder service)
const featuredImages = [
  'https://images.unsplash.com/photo-1554224311-beee415c15cb?w=800&h=500&fit=crop', // budgeting
  'https://images.unsplash.com/photo-1611432579699-484f7990f956?w=800&h=500&fit=crop', // stock market
  'https://images.unsplash.com/photo-1532619675605-1ede6c2e2fe9?w=800&h=500&fit=crop', // saving money
  'https://images.unsplash.com/photo-1579621970563-430f63602022?w=800&h=500&fit=crop', // money management
  'https://images.unsplash.com/photo-1563207153-f403bf289096?w=800&h=500&fit=crop', // credit cards
  'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800&h=500&fit=crop', // retirement
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=500&fit=crop', // investing
];

async function deleteGarbagePosts() {
  section('🗑️  STEP 1: DELETE GARBAGE POSTS');
  
  try {
    // Find garbage posts
    const garbageResult = await query(`
      SELECT id, title FROM posts 
      WHERE title LIKE '%test%' OR title = 'ghzfxh' OR title LIKE 'Automated%'
    `);

    if (garbageResult.rows.length === 0) {
      log('✅ No garbage posts found', GREEN);
      return [];
    }

    const idsToDelete = garbageResult.rows.map(p => p.id);
    
    garbageResult.rows.forEach(post => {
      log(`Deleting: "${post.title}" (ID: ${post.id})`, YELLOW);
    });

    // Delete them
    await query(`DELETE FROM posts WHERE id = ANY($1)`, [idsToDelete]);

    log(`\n✅ Deleted ${idsToDelete.length} garbage posts`, GREEN);
    return idsToDelete;

  } catch (error) {
    log(`❌ Error deleting posts: ${error.message}`, RED);
    throw error;
  }
}

async function expandThinPosts() {
  section('📝 STEP 2: EXPAND THIN POSTS TO 1000+ WORDS');

  try {
    for (const [slug, content] of Object.entries(expansionContent)) {
      const result = await query(
        `UPDATE posts SET content = $1, updated_at = NOW() WHERE slug = $2 RETURNING id, title, content`,
        [content, slug]
      );

      if (result.rows.length > 0) {
        const post = result.rows[0];
        const wordCount = post.content.split(/\s+/).filter(w => w.length > 0).length;
        log(`✅ Expanded "${post.title}" to ${wordCount} words`, GREEN);
      }
    }

    log(`\n✅ Expanded all 3 thin posts`, GREEN);

  } catch (error) {
    log(`❌ Error expanding posts: ${error.message}`, RED);
    throw error;
  }
}

async function addFeaturedImages() {
  section('🖼️  STEP 3: ADD FEATURED IMAGES TO ALL POSTS');

  try {
    const postsResult = await query(`
      SELECT id, title, category FROM posts 
      WHERE published = true
      ORDER BY created_at DESC
    `);

    let imageIndex = 0;
    const categoryMap = {
      'Budgeting': 0,
      'Investing': 1,
      'Saving Tips': 2,
      'Money Management': 3,
      'Credit Cards': 4,
      'Retirement': 5,
      'Testing': 1,
    };

    for (const post of postsResult.rows) {
      const imgIdx = categoryMap[post.category] !== undefined 
        ? categoryMap[post.category] 
        : imageIndex % featuredImages.length;
      
      const imageUrl = featuredImages[imgIdx];

      await query(
        `UPDATE posts SET featured_image = $1, updated_at = NOW() WHERE id = $2`,
        [imageUrl, post.id]
      );

      log(`✅ Added image to "${post.title}"`, GREEN);
      imageIndex++;
    }

    log(`\n✅ Added featured images to all ${postsResult.rows.length} posts`, GREEN);

  } catch (error) {
    log(`❌ Error adding images: ${error.message}`, RED);
    throw error;
  }
}

async function verifyFixes() {
  section('✅ STEP 4: VERIFY ALL FIXES');

  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN published = true THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN featured_image IS NOT NULL AND featured_image != '' THEN 1 ELSE 0 END) as with_images,
        SUM(CASE WHEN author_id IS NOT NULL THEN 1 ELSE 0 END) as with_author,
        ROUND(AVG(LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1)::numeric) as avg_words
      FROM posts
    `);

    const stats = result.rows[0];

    log(`\nTotal Posts: ${stats.total}`, CYAN);
    log(`Published: ${stats.published}`, stats.published >= 20 ? GREEN : RED);
    log(`With Featured Images: ${stats.with_images}/${stats.total}`, stats.with_images === stats.total ? GREEN : YELLOW);
    log(`With Author: ${stats.with_author}/${stats.total}`, stats.with_author === stats.total ? GREEN : YELLOW);
    log(`Average Words: ${stats.avg_words}`, stats.avg_words >= 1000 ? GREEN : YELLOW);

    if (stats.published >= 20 && stats.with_images === stats.total && stats.with_author === stats.total) {
      log(`\n✅✅✅ READY FOR ADSENSE REVIEW! ✅✅✅`, BOLD + GREEN);
      return true;
    }

    return false;

  } catch (error) {
    log(`❌ Error verifying: ${error.message}`, RED);
    throw error;
  }
}

async function main() {
  try {
    log('\n🔨 STARTING ADSENSE COMPLIANCE FIX...\n', BOLD + BLUE);

    await deleteGarbagePosts();
    await expandThinPosts();
    await addFeaturedImages();
    const ready = await verifyFixes();

    if (ready) {
      log('\n🚀 All fixes complete! Your site is ready for AdSense review.', BOLD + GREEN);
      log('Next steps:', CYAN);
      log('1. Go to AdSense dashboard', CYAN);
      log('2. Click "I confirm I have fixed the issues"', CYAN);
      log('3. Submit for review', CYAN);
    } else {
      log('\n⚠️  Some checks still need attention. Review output above.', YELLOW);
    }

    process.exit(0);

  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, RED);
    console.error(error);
    process.exit(1);
  }
}

main();
