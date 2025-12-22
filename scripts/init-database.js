const { Pool } = require('pg');
require('dotenv').config();

const bcrypt = require('bcryptjs');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database initialization...\n');

    // Create users table
    console.log('📝 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        bio TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created\n');

    // Create posts table
    console.log('📝 Creating posts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(300) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        views INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        meta_description VARCHAR(160),
        keywords TEXT[]
      )
    `);
    console.log('✅ Posts table created\n');

    // Create indexes
    console.log('📝 Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    console.log('✅ Indexes created\n');

    // Check if admin user exists
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', ['admin@smartmoneyguide.com']);
    
    if (userCheck.rows.length === 0) {
      console.log('📝 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@smartmoneyguide.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created (email: admin@smartmoneyguide.com, password: admin123)\n');
    } else {
      console.log('ℹ️  Admin user already exists\n');
    }

    // Check if posts exist
    const postCheck = await client.query('SELECT COUNT(*) FROM posts');
    const postCount = parseInt(postCheck.rows[0].count);

    if (postCount === 0) {
      console.log('📝 Creating sample posts...\n');
      
      const adminUser = await client.query('SELECT id FROM users WHERE email = $1', ['admin@smartmoneyguide.com']);
      const authorId = adminUser.rows[0].id;

      const samplePosts = [
        {
          title: '10 Simple Ways to Save Money Every Month',
          category: 'Saving Tips',
          excerpt: 'Discover practical strategies to boost your savings without sacrificing your lifestyle. Start building your emergency fund today!',
          content: `
            <h2>Introduction</h2>
            <p>Saving money doesn't have to be difficult or require major lifestyle changes. With these 10 simple strategies, you can start building your savings today and create a more secure financial future.</p>
            
            <h2>1. Track Your Expenses</h2>
            <p>The first step to saving money is understanding where it's going. Use a budgeting app or spreadsheet to track every expense for a month. You'll be surprised at how much those small purchases add up! This awareness is the foundation of smart money management and will help you identify areas where you can cut back.</p>
            
            <h2>2. Create a Budget That Works</h2>
            <p>Once you know where your money is going, create a realistic budget using the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. This balanced approach ensures you can save while still enjoying life. Review and adjust your budget monthly to keep it relevant to your current situation.</p>
            
            <h2>3. Automate Your Savings</h2>
            <p>Set up automatic transfers from your checking account to your savings account on payday. When you "pay yourself first," you won't miss the money, and you'll be surprised how quickly your savings grow. Start with even just $50 per paycheck and increase the amount as you get comfortable with it.</p>
            
            <h2>4. Cut Unnecessary Subscriptions</h2>
            <p>Review all your monthly subscriptions - streaming services, gym memberships, apps, and magazines. Cancel anything you don't use regularly. The average person has 5-7 subscriptions they don't actively use, costing $200+ per month! That's $2,400 a year that could go into savings.</p>
            
            <h2>5. Cook at Home More Often</h2>
            <p>Restaurant meals cost 3-5 times more than home-cooked meals. Plan your meals for the week, make a shopping list, and stick to it. Meal prep on Sundays can save time during busy weekdays. You'll save money and probably eat healthier too!</p>
            
            <h2>6. Use Cashback and Rewards Programs</h2>
            <p>Take advantage of credit card rewards, store loyalty programs, and cashback apps. Just make sure to pay off your credit card balance in full each month to avoid interest charges. Many cashback apps offer bonuses for shopping at stores you already frequent.</p>
            
            <h2>7. Buy Generic Brands</h2>
            <p>Store-brand products are often just as good as name brands but cost 20-30% less. Start with non-perishables and see if you notice a difference. Most people can't tell the difference in blind taste tests!</p>
            
            <h2>8. Reduce Energy Costs</h2>
            <p>Lower your thermostat in winter and raise it in summer. Use LED bulbs, unplug devices when not in use, and consider a programmable thermostat. Small changes can reduce your energy bill by 15-25%. Some utility companies offer free energy audits to help you identify more savings opportunities.</p>
            
            <h2>9. Shop with a List</h2>
            <p>Never shop without a list, whether for groceries or other items. Impulse purchases can blow your budget. Studies show that shopping with a list can reduce spending by up to 30%. Also, avoid shopping when you're hungry - it leads to more impulse food purchases!</p>
            
            <h2>10. Find Free Entertainment</h2>
            <p>Look for free community events, use your library card for books and movies, enjoy free museum days, and explore local parks and hiking trails. Entertainment doesn't have to be expensive to be enjoyable. Many cities offer free concerts, festivals, and outdoor movies during summer months.</p>
            
            <h2>Conclusion</h2>
            <p>Start implementing these strategies one at a time. Even small changes can lead to significant savings over time. Remember, the goal isn't to deprive yourself but to make conscious choices about where your money goes. Building wealth starts with saving consistently, and these simple steps will help you get there. What money-saving strategy will you try first?</p>
          `
        },
        {
          title: 'Investing 101: A Beginner\'s Guide to Building Wealth',
          category: 'Investing',
          excerpt: 'Learn the fundamentals of investing and how to start building your investment portfolio with confidence.',
          content: `
            <h2>Why Investing Matters</h2>
            <p>Investing is one of the most powerful tools for building long-term wealth. While saving money is important, investing allows your money to grow over time through compound returns. This comprehensive guide will help you understand the basics and get started on your investment journey.</p>
            
            <h2>Understanding Investment Basics</h2>
            <p>At its core, investing means putting your money into assets that have the potential to increase in value over time. Unlike saving, where your money sits in a bank account earning minimal interest, investing involves taking calculated risks for potentially higher returns. The key is understanding different investment types and how they fit into your overall financial strategy.</p>
            
            <h2>Types of Investments</h2>
            <p><strong>Stocks:</strong> When you buy stocks, you're buying ownership in a company. Stocks can provide growth through price appreciation and dividends. They're more volatile but historically offer higher returns than other investments over the long term.</p>
            <p><strong>Bonds:</strong> Bonds are loans you make to governments or corporations. They're generally less risky than stocks and provide regular interest payments. They're great for diversification and income generation.</p>
            <p><strong>Mutual Funds:</strong> These pool money from many investors to buy a diversified portfolio of stocks and/or bonds. They're professionally managed and offer instant diversification, making them ideal for beginners.</p>
            <p><strong>ETFs (Exchange-Traded Funds):</strong> Similar to mutual funds but trade like stocks. They typically have lower fees and can be bought and sold throughout the day.</p>
            <p><strong>Real Estate:</strong> Property investing can provide rental income and appreciation. You can invest directly by buying property or indirectly through REITs (Real Estate Investment Trusts).</p>
            
            <h2>Getting Started</h2>
            <p>Before investing, build an emergency fund with 3-6 months of expenses. Pay off high-interest debt, especially credit cards. Then, determine your investment goals, risk tolerance, and time horizon. Are you investing for retirement in 30 years or a house down payment in 5 years? Your timeline will influence your investment strategy.</p>
            
            <h2>The Power of Compound Returns</h2>
            <p>Compound returns mean earning returns on your returns. Even modest monthly investments can grow substantially over time. For example, investing $500 monthly with an 8% annual return could grow to over $700,000 in 30 years! Starting early is crucial because compound returns need time to work their magic.</p>
            
            <h2>Diversification is Key</h2>
            <p>Don't put all your eggs in one basket. Spread investments across different asset types, industries, and geographic regions. This reduces risk because when one investment performs poorly, others may perform well. A well-diversified portfolio is your best defense against market volatility.</p>
            
            <h2>Consider Index Funds</h2>
            <p>For beginners, low-cost index funds that track the overall market are an excellent choice. They're diversified, have low fees, and historically outperform most actively managed funds over the long term. Many financial experts recommend them as the core of most investment portfolios.</p>
            
            <h2>Tax-Advantaged Accounts</h2>
            <p>Use retirement accounts like 401(k)s and IRAs to reduce your tax bill while investing for the future. Many employers match 401(k) contributions - that's free money! Maximize these accounts before investing in taxable accounts. Roth IRAs offer tax-free growth and withdrawals in retirement, making them incredibly valuable.</p>
            
            <h2>Stay the Course</h2>
            <p>Market volatility is normal. Don't panic and sell during downturns. Historically, markets have always recovered and reached new highs. Dollar-cost averaging - investing a fixed amount regularly regardless of market conditions - helps smooth out volatility and removes emotion from investing decisions.</p>
            
            <h2>Keep Learning</h2>
            <p>Investing is a lifelong learning process. Read books, follow reputable financial news sources, and consider consulting with a financial advisor for personalized guidance. The more you learn, the more confident and successful you'll become as an investor.</p>
            
            <h2>Common Mistakes to Avoid</h2>
            <p>Don't try to time the market - even professionals can't do it consistently. Avoid chasing hot stocks or trends. Don't let emotions drive decisions. And never invest money you can't afford to lose, especially in volatile assets like individual stocks.</p>
            
            <h2>Conclusion</h2>
            <p>Investing doesn't have to be complicated or intimidating. Start small, stay consistent, diversify your portfolio, and maintain a long-term perspective. The best time to start investing was yesterday; the second best time is today. Your future self will thank you for taking action now!</p>
          `
        },
        {
          title: 'Creating a Budget That Actually Works',
          category: 'Budgeting',
          excerpt: 'Master the art of budgeting with practical tips and strategies that you can stick to long-term.',
          content: `
            <h2>Why Budgeting is Essential</h2>
            <p>A budget is simply a plan for your money. It helps you understand where your money goes, prevents overspending, and ensures you're working toward your financial goals. Despite its importance, many people struggle with budgeting because they make it too complicated or restrictive. This guide will help you create a realistic, sustainable budget that works for your unique situation.</p>
            
            <h2>The 50/30/20 Rule</h2>
            <p>This simple framework divides your after-tax income into three categories: 50% for needs (housing, food, utilities, transportation, minimum debt payments), 30% for wants (entertainment, dining out, hobbies, subscriptions), and 20% for savings and additional debt repayment. It's flexible enough to work for most people while providing clear guidelines.</p>
            
            <h2>Track Your Current Spending</h2>
            <p>Before creating a budget, track every expense for at least one month. Use apps like Mint, YNAB (You Need A Budget), or a simple spreadsheet. This reveals your actual spending patterns and highlights areas where you're overspending. Many people are shocked to discover they spend $200+ monthly on coffee shops or $150 on subscriptions they barely use!</p>
            
            <h2>Categorize Your Expenses</h2>
            <p>Divide expenses into fixed (same amount each month like rent, car payment, insurance) and variable (fluctuate monthly like groceries, gas, entertainment). Fixed expenses are easier to plan for, while variable expenses need more attention and control. Understanding this distinction helps you identify where you have flexibility to cut back if needed.</p>
            
            <h2>Set Realistic Goals</h2>
            <p>Your budget should reflect your priorities and values. Want to travel more? Allocate money for it. Trying to pay off debt? Budget aggressively for debt repayment. Be honest about what matters to you - a budget that doesn't align with your values won't last. Set both short-term goals (building a $1,000 emergency fund) and long-term goals (saving for retirement).</p>
            
            <h2>Build in Flexibility</h2>
            <p>Life happens! Include a miscellaneous category for unexpected expenses. Allow yourself some "fun money" with no guilt attached. Overly restrictive budgets fail because they don't account for reality. Having a $50-100 monthly "whatever" category can be the difference between sticking to your budget and abandoning it.</p>
            
            <h2>Use the Zero-Based Budget Method</h2>
            <p>Give every dollar a job. Your income minus expenses should equal zero, meaning you've allocated all money, including savings and investments. This doesn't mean spending everything - it means consciously deciding what to do with every dollar you earn. This method prevents money from "disappearing" without you knowing where it went.</p>
            
            <h2>Automate When Possible</h2>
            <p>Set up automatic transfers for savings, bill payments, and investments. Automation removes the burden of remembering and reduces the temptation to skip savings. Pay yourself first by automatically moving money to savings before you have a chance to spend it. Most banks allow you to set up automatic transfers on payday.</p>
            
            <h2>Review and Adjust Monthly</h2>
            <p>Your budget isn't set in stone. Review it monthly and adjust as needed. Did you overspend on groceries but underspend on entertainment? Adjust next month's allocations. Life changes - new job, moving, having a baby - require budget updates. Schedule a monthly "money date" with yourself (or partner) to review finances and update your budget.</p>
            
            <h2>Use Cash for Problem Categories</h2>
            <p>If you consistently overspend in certain categories (like dining out), try the envelope method. Withdraw cash for that category and only spend what's in the envelope. When it's gone, you're done spending in that category for the month. Physical cash makes spending more tangible than swiping a card.</p>
            
            <h2>Plan for Irregular Expenses</h2>
            <p>Don't let annual or semi-annual expenses (car registration, insurance premiums, holiday gifts) derail your budget. Calculate the yearly cost and divide by 12, then save that amount monthly. This way, you're prepared when these expenses come due. Create a separate savings account for irregular expenses to keep the money separate from your emergency fund.</p>
            
            <h2>Include Sinking Funds</h2>
            <p>These are savings categories for specific future expenses or goals - vacation, new car, home repairs, electronics replacement. Contribute to these monthly so the money is there when needed. Sinking funds prevent you from raiding your emergency fund or going into debt for planned purchases.</p>
            
            <h2>Don't Forget to Budget for Fun</h2>
            <p>All work and no play makes for a miserable budget. Allocate money for entertainment, hobbies, and dining out. The key is being intentional about it rather than spending impulsively. When fun is part of your plan, you can enjoy it guilt-free. Life is about balance - your budget should reflect that.</p>
            
            <h2>Dealing with Budget Shortfalls</h2>
            <p>If expenses exceed income, you have two options: increase income or decrease expenses. Look for side hustles, ask for a raise, or sell items you don't need. On the expense side, scrutinize wants versus needs. Can you downgrade subscriptions? Eat out less? Find cheaper insurance? Small cuts across multiple categories add up quickly.</p>
            
            <h2>Common Budgeting Mistakes</h2>
            <p>Don't forget about irregular expenses. Don't make your budget so restrictive you can't stick to it. Don't budget based on gross income instead of net (after-tax) income. Don't ignore small expenses - they add up. And don't give up after one bad month - budgeting is a skill that improves with practice.</p>
            
            <h2>Conclusion</h2>
            <p>A successful budget is one you can maintain long-term. It should reduce financial stress, not create more. Start simple, be honest with yourself, and remember that the goal is progress, not perfection. Your first budget won't be perfect, and that's okay. What matters is getting started and improving each month. Take control of your money today, and watch how it transforms your financial life!</p>
          `
        },
        {
          title: 'Retirement Planning: Start Building Your Future Today',
          category: 'Retirement',
          excerpt: 'It\'s never too early (or too late) to start planning for retirement. Learn the essential strategies for a comfortable retirement.',
          content: `
            <h2>Why Start Planning Now?</h2>
            <p>Retirement might seem far away, but starting early gives you an enormous advantage thanks to compound returns. Even if you're starting later, there are strategies to catch up. The earlier you start, the less you need to save each month, and the more comfortable your retirement will be. This comprehensive guide will help you create a solid retirement plan regardless of your current age or financial situation.</p>
            
            <h2>How Much Will You Need?</h2>
            <p>A common rule is you'll need 70-80% of your pre-retirement income annually in retirement. If you earn $60,000 now, plan for $42,000-$48,000 per year in retirement. Use online retirement calculators to get a personalized estimate based on your expected retirement age, life expectancy, and desired lifestyle. Don't forget to factor in inflation - what costs $1,000 today might cost $2,000 in 30 years!</p>
            
            <h2>Understanding Retirement Accounts</h2>
            <p><strong>401(k):</strong> Employer-sponsored retirement account with pre-tax contributions. Many employers match contributions - always contribute at least enough to get the full match. It's free money! For 2024, you can contribute up to $23,000 annually, or $30,500 if you're 50 or older.</p>
            <p><strong>Traditional IRA:</strong> Individual retirement account with tax-deductible contributions. You pay taxes on withdrawals in retirement. Contribution limit is $7,000 annually ($8,000 if 50+).</p>
            <p><strong>Roth IRA:</strong> Contributions are after-tax, but withdrawals in retirement are tax-free! This is incredibly valuable for tax diversification. If you expect to be in a higher tax bracket in retirement, a Roth IRA is particularly attractive.</p>
            <p><strong>Roth 401(k):</strong> Combines features of 401(k) and Roth IRA. After-tax contributions with tax-free withdrawals. Many employers now offer this option alongside traditional 401(k)s.</p>
            
            <h2>The Power of Employer Match</h2>
            <p>If your employer offers a 401(k) match, contribute at least enough to get the full match. It's an immediate 100% return on your investment! For example, if your employer matches 50% up to 6% of your salary, and you earn $50,000, that's $1,500 in free money annually. Over a career, this can add hundreds of thousands of dollars to your retirement savings.</p>
            
            <h2>Investment Strategy for Retirement</h2>
            <p>Younger investors can afford more risk with a stock-heavy portfolio (80-90% stocks). As you near retirement, gradually shift to more conservative investments like bonds. A common rule is subtract your age from 110 to determine your stock allocation percentage. So at age 30, you might have 80% in stocks, while at 60, you'd have 50% in stocks.</p>
            
            <h2>Target-Date Funds</h2>
            <p>These funds automatically adjust their asset allocation as you near retirement, becoming more conservative over time. They're perfect for hands-off investors. Just choose the fund with a target date closest to your expected retirement year. For example, if you plan to retire around 2050, choose a 2050 target-date fund.</p>
            
            <h2>Social Security Planning</h2>
            <p>Don't ignore Social Security! While it shouldn't be your only retirement income, it's an important piece of the puzzle. You can start benefits at 62, but waiting until full retirement age (66-67) or even 70 significantly increases your monthly benefit. Delaying from 62 to 70 can increase your benefit by 75% or more! Check your estimated benefits at SSA.gov.</p>
            
            <h2>Catch-Up Contributions</h2>
            <p>If you're 50 or older, take advantage of catch-up contributions - extra amounts you can contribute beyond regular limits. This helps if you started saving late or had years where you couldn't save much. For 2024, you can contribute an extra $7,500 to a 401(k) and $1,000 to an IRA.</p>
            
            <h2>Healthcare Costs in Retirement</h2>
            <p>Healthcare is often retirees' biggest expense. A healthy 65-year-old couple may need $315,000 saved just for healthcare costs in retirement. Consider a Health Savings Account (HSA) if you have a high-deductible health plan. It's triple tax-advantaged and can be used for retirement healthcare expenses. Many call it a "stealth retirement account" because of these incredible tax benefits.</p>
            
            <h2>Avoiding Early Withdrawal Penalties</h2>
            <p>Generally, withdrawing from retirement accounts before age 59½ triggers a 10% penalty plus income taxes. There are exceptions for hardships, but try to avoid early withdrawals. Let your money grow! If you must access money, consider Roth IRA contributions (not earnings) which can be withdrawn penalty-free anytime since you already paid taxes on them.</p>
            
            <h2>Multiple Income Streams</h2>
            <p>Don't rely solely on retirement accounts. Consider building multiple income streams: rental properties, dividend-paying stocks, part-time work in retirement, or a side business. Diversifying income sources provides security and flexibility. Many retirees find that working part-time in something they enjoy provides both income and purpose.</p>
            
            <h2>Required Minimum Distributions (RMDs)</h2>
            <p>At age 73, you must start taking minimum distributions from traditional retirement accounts (except Roth IRAs). Plan for the tax impact of these required withdrawals. Consider doing Roth conversions earlier in retirement before RMDs start to manage your tax liability. This strategy requires careful planning but can save significant taxes over your lifetime.</p>
            
            <h2>Estate Planning</h2>
            <p>Update beneficiaries on all accounts regularly, especially after major life events (marriage, divorce, births). Consider creating a will, healthcare directive, and power of attorney. If you have significant assets, consult an estate planning attorney. Many retirement accounts allow you to pass assets directly to heirs, but proper planning ensures your wishes are carried out and minimizes taxes.</p>
            
            <h2>Inflation Protection</h2>
            <p>Over 30 years of retirement, inflation can significantly erode purchasing power. Keep some growth investments even in retirement. Treasury Inflation-Protected Securities (TIPS) and I Bonds can help protect against inflation. Don't go 100% conservative too early - you might live 30+ years in retirement and need growth to keep up with rising costs.</p>
            
            <h2>When to Start Taking Benefits</h2>
            <p>Claiming Social Security early (age 62) gives you money sooner but permanently reduces your benefit. Waiting until 70 maximizes your benefit. Consider your health, longevity in your family, other income sources, and whether you're married (spousal benefits can be complex). For most people in good health with other income sources, delaying Social Security increases lifetime benefits.</p>
            
            <h2>Conclusion</h2>
            <p>Retirement planning is a marathon, not a sprint. Start where you are, do what you can, and increase contributions as your income grows. The most important step is starting now, regardless of your age. Automate your contributions, take advantage of employer matches and tax benefits, diversify your investments, and adjust your plan as life changes. Your future self will thank you for taking action today. Remember: the best time to start was yesterday, the second best time is today!</p>
          `
        },
        {
          title: 'Understanding Credit Cards: Benefits and Pitfalls',
          category: 'Credit Cards',
          excerpt: 'Learn how to use credit cards responsibly while maximizing rewards and building your credit score.',
          content: `
            <h2>Credit Cards: Tool or Trap?</h2>
            <p>Credit cards can be powerful financial tools or dangerous traps - it all depends on how you use them. Used responsibly, they offer convenience, rewards, fraud protection, and help build credit. Used carelessly, they can lead to debt, damaged credit, and financial stress. This guide will help you understand credit cards and use them to your advantage while avoiding common pitfalls.</p>
            
            <h2>How Credit Cards Work</h2>
            <p>When you use a credit card, you're borrowing money from the card issuer to make purchases. You receive a monthly statement showing all charges and must pay at least the minimum payment by the due date. Pay the full balance to avoid interest charges. If you carry a balance, you'll pay interest (APR - Annual Percentage Rate), which can range from 15% to 25% or more. This is why paying in full is crucial - credit card interest can quickly spiral out of control.</p>
            
            <h2>The Golden Rule: Pay in Full</h2>
            <p>Always pay your full balance before the due date. This is the most important credit card rule! You'll avoid interest charges and build good credit without paying a penny in interest. Treat your credit card like a debit card - only charge what you can afford to pay off immediately. If you can't pay the full balance, you're spending beyond your means and should reconsider your purchases.</p>
            
            <h2>Benefits of Credit Cards</h2>
            <p><strong>Credit Building:</strong> Responsible use helps build your credit score, essential for loans, mortgages, and sometimes even job applications. Payment history is the biggest factor in your credit score, so paying on time is crucial.</p>
            <p><strong>Rewards:</strong> Many cards offer cash back, points, or miles. Choose rewards that match your spending patterns. If you travel frequently, a travel rewards card makes sense. If not, simple cash back might be better. Some cards offer 2-5% back on certain categories!</p>
            <p><strong>Purchase Protection:</strong> Credit cards typically offer better fraud protection than debit cards. Many extend warranties, offer price protection, and provide purchase insurance. These benefits can save you hundreds or thousands of dollars.</p>
            <p><strong>Building Credit History:</strong> A longer credit history generally helps your credit score. Start with one card and keep it open long-term. The average age of your accounts matters for your credit score.</p>
            <p><strong>Emergency Buffer:</strong> While you shouldn't rely on credit cards for emergencies, they can provide temporary relief in true emergencies while you work on building an emergency fund.</p>
            
            <h2>Understanding Your Credit Score</h2>
            <p>Your credit score (typically FICO score) ranges from 300-850. Higher is better! Factors include: payment history (35%), amounts owed (30%), length of credit history (15%), new credit (10%), and credit mix (10%). A good score (700+) means better loan rates and terms, potentially saving thousands on major purchases like homes and cars.</p>
            
            <h2>Choosing the Right Card</h2>
            <p>Consider: annual fees (only worth it if rewards exceed the fee), rewards structure (does it match your spending?), APR (important if you'll carry a balance, though ideally you won't!), and sign-up bonuses (can be valuable but don't overspend to get them). Read the fine print and understand all fees before applying. Compare multiple cards using websites like NerdWallet or Credit Karma.</p>
            
            <h2>Credit Utilization Ratio</h2>
            <p>This is the percentage of available credit you're using. Keep it below 30%, ideally under 10%, for the best credit score impact. For example, if you have a $10,000 limit, try to keep your balance below $3,000, preferably below $1,000. High utilization suggests you're overextended financially, which worries lenders and hurts your score.</p>
            
            <h2>Common Credit Card Mistakes</h2>
            <p>Carrying a balance thinking it helps your score (myth! Pay in full). Missing payments (biggest credit score killer - set up autopay). Only paying minimums (you'll pay far more in interest and stay in debt for years). Opening too many cards too quickly (hard inquiries temporarily lower your score). Closing old accounts (reduces available credit and shortens credit history). Maxing out cards (terrible for your credit score and financial health).</p>
            
            <h2>What to Do If You Have Credit Card Debt</h2>
            <p>Stop using the cards immediately. List all debts with interest rates. Use the avalanche method (pay off highest interest rate first) or snowball method (pay off smallest balance first for psychological wins). Consider a balance transfer card with 0% intro APR, but make sure you can pay it off during the promotional period. Create a realistic plan to become debt-free and stick to it. Consider credit counseling if debt feels overwhelming.</p>
            
            <h2>Maximizing Rewards</h2>
            <p>Use cards that offer the best rewards for your spending categories. Pay attention to rotating categories. Some cards offer 5% back on different categories each quarter. Use shopping portals for online purchases to stack rewards. But remember: don't spend more just to earn rewards! The goal is to get rewards on spending you'd do anyway, not to