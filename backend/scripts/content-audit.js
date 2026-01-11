#!/usr/bin/env node

/**
 * 🔍 SMART MONEY GUIDE - CONTENT AUDIT SCRIPT
 * Checks 24 posts for AdSense compliance & quality standards
 * Run: node scripts/content-audit.js
 */

require('dotenv').config();
const { query } = require('../../config/database');

// Color codes for terminal output
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

function countWords(htmlContent) {
  if (!htmlContent) return 0;
  // Remove HTML tags
  const plainText = htmlContent.replace(/<[^>]*>/g, '');
  // Remove extra whitespace
  const words = plainText.trim().split(/\s+/);
  return words.filter(w => w.length > 0).length;
}

async function auditContent() {
  try {
    log('\n🚀 Starting Content Audit for AdSense Compliance...\n', BOLD + BLUE);

    // Get all posts
    const result = await query(`
      SELECT 
        id, 
        title, 
        slug,
        category,
        excerpt,
        content,
        author_id,
        published,
        featured_image,
        created_at,
        updated_at,
        views
      FROM posts 
      ORDER BY created_at DESC
    `);

    const posts = result.rows;
    log(`📊 Total Posts Found: ${posts.length}`, CYAN);

    if (posts.length === 0) {
      log('❌ No posts found in database!', RED);
      process.exit(1);
    }

    // Initialize metrics
    const metrics = {
      totalPosts: posts.length,
      publishedPosts: 0,
      draftPosts: 0,
      postsWithMinWords: 0,
      postsUnderMinWords: 0,
      postsWithAuthor: 0,
      postsWithoutAuthor: 0,
      postsWithFeaturedImage: 0,
      postsWithoutFeaturedImage: 0,
      averageWordCount: 0,
      averageViews: 0,
      totalWords: 0,
      totalViews: 0,
      issues: [],
      warnings: [],
      successes: [],
    };

    section('📝 INDIVIDUAL POST AUDIT');

    // Audit each post
    posts.forEach((post, index) => {
      const wordCount = countWords(post.content);
      const hasAuthor = post.author_id !== null;
      const hasFeaturedImage = post.featured_image && post.featured_image.length > 0;
      const isPublished = post.published === true;

      // Update metrics
      metrics.totalWords += wordCount;
      metrics.totalViews += post.views || 0;

      if (isPublished) {
        metrics.publishedPosts++;
      } else {
        metrics.draftPosts++;
      }

      if (wordCount >= 1000) {
        metrics.postsWithMinWords++;
      } else {
        metrics.postsUnderMinWords++;
      }

      if (hasAuthor) {
        metrics.postsWithAuthor++;
      } else {
        metrics.postsWithoutAuthor++;
      }

      if (hasFeaturedImage) {
        metrics.postsWithFeaturedImage++;
      } else {
        metrics.postsWithoutFeaturedImage++;
      }

      // Build post report
      const statusIcon = isPublished ? '✅' : '📄';
      const wordIcon = wordCount >= 1000 ? '✅' : '❌';
      const authorIcon = hasAuthor ? '✅' : '⚠️';
      const imageIcon = hasFeaturedImage ? '✅' : '⚠️';

      log(`\n${index + 1}. ${post.title}`, BOLD + BLUE);
      log(`   Slug: ${post.slug}`, CYAN);
      log(`   Status: ${statusIcon} ${isPublished ? 'Published' : 'Draft'}`, isPublished ? GREEN : YELLOW);
      log(`   Category: ${post.category}`, CYAN);
      log(`   Word Count: ${wordIcon} ${wordCount} words ${wordCount < 1000 ? `(NEEDS ${1000 - wordCount} more)` : '(Good)'}`, wordCount >= 1000 ? GREEN : RED);
      log(`   Author: ${authorIcon} ${hasAuthor ? 'Yes' : 'Missing'}`, hasAuthor ? GREEN : YELLOW);
      log(`   Featured Image: ${imageIcon} ${hasFeaturedImage ? 'Yes' : 'Missing'}`, hasFeaturedImage ? GREEN : YELLOW);
      log(`   Created: ${new Date(post.created_at).toLocaleDateString()}`, CYAN);
      log(`   Views: ${post.views || 0}`, CYAN);
      log(`   Excerpt Length: ${post.excerpt ? post.excerpt.length : 0} chars`, CYAN);

      // Collect issues
      if (!isPublished) {
        metrics.warnings.push(`"${post.title}" is still in DRAFT - needs to be PUBLISHED`);
      }

      if (wordCount < 1000) {
        metrics.issues.push(`"${post.title}" is only ${wordCount} words - NEEDS ${1000 - wordCount} MORE WORDS`);
      } else {
        metrics.successes.push(`"${post.title}" meets word count (${wordCount})`);
      }

      if (!hasAuthor) {
        metrics.warnings.push(`"${post.title}" missing author_id`);
      }

      if (!hasFeaturedImage) {
        metrics.warnings.push(`"${post.title}" missing featured image`);
      }

      if (!post.excerpt || post.excerpt.length < 100) {
        metrics.warnings.push(`"${post.title}" has short excerpt (${post.excerpt ? post.excerpt.length : 0} chars)`);
      }
    });

    // Calculate averages
    metrics.averageWordCount = Math.round(metrics.totalWords / metrics.totalPosts);
    metrics.averageViews = Math.round(metrics.totalViews / metrics.totalPosts);

    // Summary section
    section('📊 AUDIT SUMMARY');

    log(`\nPublished Posts: ${metrics.publishedPosts}/${metrics.totalPosts}`, metrics.publishedPosts >= 20 ? GREEN : YELLOW);
    log(`Draft Posts: ${metrics.draftPosts}/${metrics.totalPosts}`, metrics.draftPosts === 0 ? GREEN : YELLOW);

    log(`\nWord Count Compliance:`, BOLD + CYAN);
    log(`  ✅ 1000+ words: ${metrics.postsWithMinWords}/${metrics.totalPosts}`, metrics.postsWithMinWords >= 20 ? GREEN : RED);
    log(`  ❌ Under 1000: ${metrics.postsUnderMinWords}/${metrics.totalPosts}`, metrics.postsUnderMinWords === 0 ? GREEN : RED);
    log(`  📊 Average words: ${metrics.averageWordCount}`, metrics.averageWordCount >= 1000 ? GREEN : RED);
    log(`  📈 Total words: ${metrics.totalWords}`, CYAN);

    log(`\nMetadata Compliance:`, BOLD + CYAN);
    log(`  ✅ With Author: ${metrics.postsWithAuthor}/${metrics.totalPosts}`, metrics.postsWithAuthor === metrics.totalPosts ? GREEN : YELLOW);
    log(`  ✅ With Featured Image: ${metrics.postsWithFeaturedImage}/${metrics.totalPosts}`, metrics.postsWithFeaturedImage === metrics.totalPosts ? GREEN : YELLOW);
    log(`  📊 Average views: ${metrics.averageViews}`, CYAN);

    // AdSense Readiness
    section('🎯 ADSENSE READINESS CHECK');

    const readinessChecks = [
      {
        name: 'Minimum 20 published posts',
        pass: metrics.publishedPosts >= 20,
        current: `${metrics.publishedPosts}/20`,
      },
      {
        name: 'All posts 1000+ words',
        pass: metrics.postsUnderMinWords === 0,
        current: `${metrics.postsWithMinWords}/20 compliant`,
      },
      {
        name: 'Average 1000+ words per post',
        pass: metrics.averageWordCount >= 1000,
        current: `${metrics.averageWordCount} avg`,
      },
      {
        name: 'All posts published (no drafts)',
        pass: metrics.draftPosts === 0,
        current: `${metrics.publishedPosts} published`,
      },
      {
        name: 'Featured images on all posts',
        pass: metrics.postsWithFeaturedImage >= 20,
        current: `${metrics.postsWithFeaturedImage} have images`,
      },
      {
        name: 'Author info on all posts',
        pass: metrics.postsWithAuthor === metrics.totalPosts,
        current: `${metrics.postsWithAuthor}/${metrics.totalPosts} have author`,
      },
    ];

    readinessChecks.forEach(check => {
      const icon = check.pass ? '✅' : '❌';
      const color = check.pass ? GREEN : RED;
      log(`${icon} ${check.name}: ${check.current}`, color);
    });

    const allChecksPassed = readinessChecks.every(c => c.pass);
    const readyForReview = metrics.publishedPosts >= 20 && metrics.postsUnderMinWords <= 2;

    // Issues section
    if (metrics.issues.length > 0) {
      section('❌ CRITICAL ISSUES (Must Fix Before AdSense Review)');
      metrics.issues.forEach((issue, i) => {
        log(`${i + 1}. ${issue}`, RED);
      });
    }

    // Warnings section
    if (metrics.warnings.length > 0) {
      section('⚠️  WARNINGS (Should Fix Before AdSense Review)');
      metrics.warnings.forEach((warning, i) => {
        log(`${i + 1}. ${warning}`, YELLOW);
      });
    }

    // Final recommendation
    section('🎯 FINAL RECOMMENDATION');

    if (allChecksPassed) {
      log('\n✅ YOUR SITE IS READY FOR ADSENSE REVIEW!', BOLD + GREEN);
      log('All compliance checks passed. Submit to AdSense now.', GREEN);
      log('\nScore: 100/100', BOLD + GREEN);
    } else if (readyForReview) {
      log('\n⚠️  SITE IS MOSTLY READY (Can submit but address warnings)', BOLD + YELLOW);
      log(`You have ${metrics.postsWithMinWords} posts with 1000+ words (need 20)`, YELLOW);
      log(`${metrics.issues.length} critical issues to fix`, RED);
      log(`${metrics.warnings.length} warnings to address`, YELLOW);
      log('\nScore: 75-85/100', BOLD + YELLOW);
    } else {
      log('\n❌ SITE IS NOT READY (Fix critical issues first)', BOLD + RED);
      log(`You have ${metrics.postsWithMinWords} posts with 1000+ words (need 20+)`, RED);
      log(`${metrics.issues.length} critical issues must be fixed`, RED);
      log(`${metrics.warnings.length} warnings should be addressed`, YELLOW);
      log('\nScore: Below 75/100', BOLD + RED);
      log('\n📋 Action Plan:', BOLD + CYAN);
      log('1. Expand posts under 1000 words to meet minimum', CYAN);
      log('2. Publish any remaining draft posts', CYAN);
      log('3. Add meta descriptions to all posts', CYAN);
      log('4. Ensure author info is on all posts', CYAN);
      log('5. Add more posts if under 20 published', CYAN);
    }

    log('\n🚀 Once issues are fixed, run this script again to verify', BOLD + CYAN);
    log('\nGood luck! 💪\n', CYAN);

    process.exit(allChecksPassed || readyForReview ? 0 : 1);

  } catch (error) {
    log(`\n❌ Error during audit: ${error.message}`, RED);
    console.error(error);
    process.exit(1);
  }
}

// Run audit
auditContent();
