const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function auditContent() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ADSENSE CONTENT QUALITY AUDIT - tilana.online');
    console.log('='.repeat(80) + '\n');
    
    // Get all posts with content
    const postsResult = await pool.query(`
      SELECT 
        id, 
        title, 
        category, 
        excerpt,
        content,
        published,
        created_at,
        LENGTH(COALESCE(content, '')) as content_length
      FROM posts
      ORDER BY created_at DESC
    `);

    const posts = postsResult.rows;
    console.log(`Total Posts: ${posts.length}\n`);

    if (posts.length === 0) {
      console.log('❌ NO POSTS FOUND - This is the main issue!');
      console.log('\nGoogle rejected your site because:');
      console.log('1. No content exists to review');
      console.log('2. Site appears empty/incomplete\n');
      pool.end();
      return;
    }

    // Analyze each post
    let qualityStats = {
      excellent: 0,      // 1500+ words, well-structured
      good: 0,           // 1000-1499 words
      acceptable: 0,     // 750-999 words
      weak: 0,           // 300-749 words
      tooShort: 0        // <300 words
    };

    let issues = [];
    let postDetails = [];

    posts.forEach((post, idx) => {
      const content = post.content || '';
      const excerpt = post.excerpt || '';
      
      // Strip HTML tags for word count
      const plainText = content
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      const wordCount = plainText.split(/\s+/).filter(w => w).length;
      const charCount = plainText.length;

      // Determine quality tier
      let tier;
      if (wordCount >= 1500) tier = 'excellent';
      else if (wordCount >= 1000) tier = 'good';
      else if (wordCount >= 750) tier = 'acceptable';
      else if (wordCount >= 300) tier = 'weak';
      else tier = 'tooShort';

      qualityStats[tier]++;

      // Check for common issues
      let postIssues = [];
      if (wordCount < 800) {
        postIssues.push(`Too short (${wordCount} words, need 1000+)`);
      }
      if (!excerpt || excerpt.length < 50) {
        postIssues.push('Missing or weak excerpt');
      }
      if (charCount === 0) {
        postIssues.push('No actual content');
      }
      if (post.published === false) {
        postIssues.push('Not published');
      }

      postDetails.push({
        id: post.id,
        title: post.title,
        category: post.category,
        wordCount,
        charCount,
        published: post.published,
        tier,
        issues: postIssues
      });

      if (postIssues.length > 0) {
        issues.push({
          title: post.title,
          wordCount,
          problems: postIssues
        });
      }
    });

    // Display content quality breakdown
    console.log('📈 CONTENT QUALITY BREAKDOWN:\n');
    console.log(`  ✅ Excellent (1500+ words): ${qualityStats.excellent} posts`);
    console.log(`  ✅ Good (1000-1499 words): ${qualityStats.good} posts`);
    console.log(`  ⚠️  Acceptable (750-999 words): ${qualityStats.acceptable} posts`);
    console.log(`  ❌ Weak (300-749 words): ${qualityStats.weak} posts`);
    console.log(`  ❌ Too Short (<300 words): ${qualityStats.tooShort} posts\n`);

    // Why Google rejected it
    console.log('🚨 WHY GOOGLE REJECTED YOUR SITE:\n');
    
    const totalAdequate = qualityStats.excellent + qualityStats.good;
    const totalInadequate = qualityStats.weak + qualityStats.tooShort + (posts.length - totalAdequate - qualityStats.acceptable);
    
    if (totalInadequate > totalAdequate) {
      console.log(`  1. ❌ Most posts are too short (${totalInadequate} out of ${posts.length} posts below 1000 words)`);
      console.log('     → Google sees "thin content" - not enough substance for user value');
    }
    
    if (qualityStats.tooShort > 0) {
      console.log(`  2. ❌ ${qualityStats.tooShort} posts are severely short (<300 words)`);
      console.log('     → Looks like placeholder/low-effort content');
    }

    if (issues.length > posts.length * 0.5) {
      console.log(`  3. ❌ Over 50% of posts have quality issues`);
    }

    const unpublished = posts.filter(p => !p.published).length;
    if (unpublished > 0) {
      console.log(`  4. ❌ ${unpublished} posts are not published - not visible to Google`);
    }

    console.log('\n🔧 DETAILED POST STATUS:\n');
    
    postDetails.forEach((post, idx) => {
      const statusIcon = post.tier === 'excellent' ? '✅' : 
                        post.tier === 'good' ? '✅' : 
                        post.tier === 'acceptable' ? '⚠️ ' : '❌';
      
      console.log(`${idx + 1}. ${statusIcon} "${post.title}"`);
      console.log(`   Category: ${post.category} | Words: ${post.wordCount} | Published: ${post.published ? 'Yes' : 'No'}`);
      
      if (post.issues.length > 0) {
        post.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue}`);
        });
      }
      console.log('');
    });

    // Recommendations
    console.log('\n' + '='.repeat(80));
    console.log('💡 ACTION PLAN TO FIX ADSENSE REJECTION:');
    console.log('='.repeat(80) + '\n');

    if (qualityStats.tooShort > 0 || qualityStats.weak > 0) {
      console.log('1️⃣  EXPAND SHORT POSTS');
      console.log(`   → ${qualityStats.tooShort + qualityStats.weak} posts need expansion to 1000+ words`);
      console.log('   → Add original insights, examples, expert analysis');
      console.log('   → Include statistics, case studies, how-to sections\n');
    }

    if (unpublished > 0) {
      console.log('2️⃣  PUBLISH ALL POSTS');
      console.log(`   → ${unpublished} posts are hidden from Google`);
      console.log('   → Mark all finished posts as published\n');
    }

    console.log('3️⃣  ENSURE ORIGINAL CONTENT');
    console.log('   → Each post must have unique perspective/value');
    console.log('   → Avoid AI-generated filler content');
    console.log('   → Include personal insights, data, examples\n');

    console.log('4️⃣  ADD PROPER STRUCTURE');
    console.log('   → Clear headings (H1, H2, H3)');
    console.log('   → Short paragraphs (3-4 sentences each)');
    console.log('   → Bullet points for key concepts\n');

    console.log('5️⃣  OPTIMIZE FOR USERS');
    console.log('   → Write for readers, not search engines');
    console.log('   → Solve actual financial questions people ask');
    console.log('   → Be specific with numbers, dates, real examples\n');

    console.log('6️⃣  RESUBMIT FOR REVIEW');
    console.log('   → After improvements, request manual review in AdSense');
    console.log('   → Can take 1-2 weeks for Google to re-evaluate\n');

    console.log('='.repeat(80) + '\n');

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
  }
}

auditContent();
