const Pool = require('pg').Pool;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finance_blog'
});

// Professional content generation templates
const contentTemplates = {
    'Saving Tips': {
        excerpt: (title) => `Master essential saving techniques to build wealth and financial security. Learn proven strategies to maximize your savings and achieve your financial goals efficiently.`,
        intro: (title) => `Learn practical strategies to save more money effectively. This comprehensive guide covers budgeting techniques, automated savings methods, and proven ways to build substantial emergency funds.`,
        sections: [
            { heading: 'Why Saving Matters', content: 'Building a solid savings foundation is crucial for financial independence. Consistent savings provide security, flexibility, and opportunities for growth.' },
            { heading: 'Budgeting Essentials', content: 'Create a sustainable budget by tracking income and expenses. Use the 50/30/20 rule: allocate 50% to needs, 30% to wants, and 20% to savings and debt repayment.' },
            { heading: 'Automation Strategies', content: 'Set up automatic transfers to savings accounts. This "pay yourself first" approach ensures consistent savings without relying on willpower.' },
            { heading: 'High-Yield Savings Options', content: 'Explore high-yield savings accounts, money market accounts, and CDs. These options offer better returns than traditional accounts while maintaining liquidity.' },
            { heading: 'Emergency Fund Building', content: 'Build 3-6 months of living expenses in emergency savings. This safety net protects against unexpected financial hardships.' },
            { heading: 'Key Takeaways', content: 'Focus on consistent saving habits, automate your savings process, and regularly review your progress toward financial goals.' }
        ]
    },
    'Investing': {
        excerpt: (title) => `Understand investment fundamentals and build a diversified portfolio. Discover strategies to grow your wealth through smart investing decisions aligned with your goals.`,
        intro: (title) => `Start your investment journey with confidence. This guide covers fundamental principles, asset allocation strategies, and proven approaches to building long-term wealth.`,
        sections: [
            { heading: 'Investment Basics', content: 'Understand stocks, bonds, mutual funds, and ETFs. Each investment type carries different risk-return profiles suited to different financial goals.' },
            { heading: 'Risk and Return', content: 'Balance risk and potential returns based on your risk tolerance and time horizon. Generally, longer timelines allow for higher-risk, higher-return investments.' },
            { heading: 'Diversification Strategy', content: 'Spread investments across asset classes, sectors, and geographies. Diversification reduces risk while maintaining growth potential.' },
            { heading: 'Dollar-Cost Averaging', content: 'Invest fixed amounts regularly regardless of market conditions. This approach reduces timing risk and builds discipline.' },
            { heading: 'Index Fund Investing', content: 'Consider low-cost index funds for consistent returns. They offer diversification, low fees, and historically strong long-term performance.' },
            { heading: 'Action Plan', content: 'Define your investment goals, determine appropriate asset allocation, and start with small consistent investments.' }
        ]
    },
    'Budgeting': {
        excerpt: (title) => `Create an effective budget that works for your lifestyle. Learn practical methods to track spending and control your finances for better money management.`,
        intro: (title) => `Take control of your finances with a solid budgeting strategy. This comprehensive guide helps you track expenses, identify spending patterns, and optimize your financial life.`,
        sections: [
            { heading: 'Why Budgeting Works', content: 'A budget provides visibility into spending patterns and highlights areas for improvement. It\'s the foundation for financial control and goal achievement.' },
            { heading: 'Popular Budgeting Methods', content: 'Explore zero-based budgeting, the 50/30/20 rule, envelope method, and percentage-based budgeting. Choose the approach that aligns with your lifestyle.' },
            { heading: 'Tracking Expenses', content: 'Use apps, spreadsheets, or notebooks to track every expense. Regular tracking reveals spending patterns and opportunities for savings.' },
            { heading: 'Setting Budget Categories', content: 'Create meaningful categories: housing, food, transportation, entertainment, savings, and debt repayment. Assign realistic spending limits to each.' },
            { heading: 'Review and Adjust', content: 'Review your budget monthly and adjust categories as needed. Regular reviews ensure the budget remains relevant and effective.' },
            { heading: 'Staying Accountable', content: 'Share your budget goals with someone, use budgeting apps for reminders, and celebrate small wins to maintain motivation.' }
        ]
    },
    'Retirement': {
        excerpt: (title) => `Plan your retirement with confidence. Learn strategies for maximizing retirement savings, understanding investment vehicles, and securing your financial future.`,
        intro: (title) => `Secure your retirement with strategic planning. This guide covers retirement accounts, savings strategies, and approaches to building lasting wealth for retirement.`,
        sections: [
            { heading: 'Retirement Planning Basics', content: 'Start early to leverage compound growth. Calculate retirement needs based on lifestyle, expected lifespan, and inflation rates.' },
            { heading: '401(k) and Employer Plans', content: 'Maximize employer 401(k) contributions, especially matched amounts. These accounts offer tax benefits and substantial growth potential.' },
            { heading: 'IRA Options', content: 'Choose between Traditional and Roth IRAs based on tax situation. Both offer tax advantages and are essential retirement savings vehicles.' },
            { heading: 'Social Security Strategy', content: 'Understand Social Security benefits and optimal claiming strategies. Delaying benefits can increase lifetime income by 76%.' },
            { heading: 'Retirement Withdrawal Strategies', content: 'Use the 4% rule as a starting point for sustainable withdrawals. Create a tax-efficient withdrawal plan from various accounts.' },
            { heading: 'Retirement Milestones', content: 'Monitor progress toward retirement goals, adjust contributions as income increases, and regularly review investment allocations.' }
        ]
    },
    'Credit Cards': {
        excerpt: (title) => `Master credit card management to build credit, earn rewards, and avoid debt. Learn smart strategies for using credit cards to your financial advantage.`,
        intro: (title) => `Use credit cards strategically to build credit and maximize rewards. This guide covers credit card selection, responsible usage, and debt avoidance strategies.`,
        sections: [
            { heading: 'Credit Card Basics', content: 'Understand credit scores, interest rates, and credit utilization. Good credit enables access to better rates and financial products.' },
            { heading: 'Choosing the Right Card', content: 'Select cards matching your spending patterns. Consider rewards categories, annual fees, and introductory offers.' },
            { heading: 'Rewards Maximization', content: 'Earn cash back, travel points, or rewards on specific categories. Align card benefits with regular spending for maximum value.' },
            { heading: 'Avoiding Credit Card Debt', content: 'Pay full balances monthly, treat credit cards as payment tools, not borrowing tools. Avoid high-interest debt that damages financial progress.' },
            { heading: 'Building Credit History', content: 'Establish credit early, maintain low utilization rates, and make on-time payments. Strong credit opens opportunities and saves money.' },
            { heading: 'Credit Protection', content: 'Monitor accounts regularly, enable fraud alerts, and report suspicious activity quickly. Protect your credit identity vigilantly.' }
        ]
    },
    'Money Management': {
        excerpt: (title) => `Develop comprehensive money management skills for financial stability. Learn how to organize finances, reduce stress, and achieve long-term financial health.`,
        intro: (title) => `Take charge of your financial life with effective money management. This guide covers financial organization, goal setting, and sustainable money habits.`,
        sections: [
            { heading: 'Financial Organization', content: 'Organize accounts, documents, and financial records. Clear organization enables better decision-making and crisis management.' },
            { heading: 'Goal Setting Framework', content: 'Define short-term, medium-term, and long-term goals. Specific, measurable goals guide financial decisions and maintain motivation.' },
            { heading: 'Income and Expense Management', content: 'Understand all income sources and track every expense. This awareness forms the foundation for financial optimization.' },
            { heading: 'Debt Management Strategy', content: 'Prioritize debt payoff using either snowball or avalanche methods. Eliminate debt systematically to improve financial health.' },
            { heading: 'Financial Protection', content: 'Maintain adequate insurance coverage, build emergency funds, and plan for unexpected expenses. Protection ensures stability.' },
            { heading: 'Long-term Wealth Building', content: 'Focus on consistent habits, regular progress reviews, and periodic adjustments. Sustainable practices build lasting wealth.' }
        ]
    }
};

// Generate professional content
function generateContent(title, category) {
    const template = contentTemplates[category] || contentTemplates['Money Management'];
    const excerpt = template.excerpt(title);
    
    let content = `<h2>${title}</h2>\n\n`;
    content += `<p>${template.intro(title)}</p>\n\n`;
    
    template.sections.forEach(section => {
        content += `<h3>${section.heading}</h3>\n`;
        content += `<p>${section.content}</p>\n\n`;
    });
    
    content += `<h3>Conclusion</h3>\n`;
    content += `<p>Implement these strategies consistently to achieve financial success. Start with one or two actionable steps and build from there. Financial excellence is a journey, not a destination.</p>\n`;
    
    return { excerpt, content };
}

// Main function
async function generateContentForAllPosts() {
    try {
        console.log('🔄 Fetching posts...\n');
        const result = await pool.query('SELECT id, title, category FROM posts WHERE excerpt IS NULL OR excerpt = \'\' ORDER BY id');
        
        if (result.rows.length === 0) {
            console.log('✅ All posts already have content!');
            process.exit(0);
        }
        
        console.log(`📝 Generating content for ${result.rows.length} posts...\n`);
        
        let updated = 0;
        for (const post of result.rows) {
            const { excerpt, content } = generateContent(post.title, post.category);
            
            // Word count check
            const wordCount = content.split(/\s+/).length;
            
            if (wordCount >= 1000) {
                await pool.query(
                    'UPDATE posts SET excerpt = $1, content = $2, updated_at = NOW() WHERE id = $3',
                    [excerpt, content, post.id]
                );
                console.log(`✅ ${post.title} (${wordCount} words)`);
                updated++;
            } else {
                console.log(`⚠️  ${post.title} - ${wordCount} words (needs expansion)`);
            }
        }
        
        console.log(`\n✨ Updated ${updated} posts with professional content!`);
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        pool.end();
    }
}

generateContentForAllPosts();
