#!/usr/bin/env node
/**
 * Finance Blog Post Cleaner
 * Removes hardcoded characters, HTML markup, and non-humanized content
 * Makes all posts high-quality and AdSense-ready
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * Clean HTML markup from content
 * Converts HTML tags to plain text naturally
 */
function cleanHtmlMarkup(content) {
  if (!content) return content;
  
  // Remove <article>, <div>, </div> tags
  content = content.replace(/<\/?article>/gi, '').replace(/<\/?div[^>]*>/gi, '');
  
  // Convert headings to plain text with natural formatting
  content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n$1\n\n');
  content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n$1\n\n');
  content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n$1\n\n');
  
  // Convert paragraphs to newlines
  content = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  // Convert lists to bullet points
  content = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
  content = content.replace(/<\/?ul[^>]*>/gi, '');
  content = content.replace(/<\/?ol[^>]*>/gi, '');
  
  // Remove all other HTML tags
  content = content.replace(/<[^>]+>/g, '');
  
  return content;
}

/**
 * Decode HTML entities to natural text
 */
function decodeHtmlEntities(content) {
  if (!content) return content;
  
  const entityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&#160;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  };
  
  Object.keys(entityMap).forEach(entity => {
    content = content.replace(new RegExp(entity, 'g'), entityMap[entity]);
  });
  
  // Decode numeric entities
  content = content.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  // Decode hex entities
  content = content.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  return content;
}

/**
 * Remove excessive whitespace while preserving paragraph structure
 */
function normalizeWhitespace(content) {
  if (!content) return content;
  
  // Replace multiple spaces with single space
  content = content.replace(/[ \t]+/g, ' ');
  
  // Replace 3+ newlines with 2 newlines (preserve paragraph breaks)
  content = content.replace(/\n{3,}/g, '\n\n');
  
  // Trim leading/trailing whitespace from each line
  content = content.split('\n').map(line => line.trim()).join('\n');
  
  // Remove non-breaking spaces and replace with regular spaces
  content = content.replace(/\u00a0/g, ' ');
  
  return content.trim();
}

/**
 * Remove hardcoded strings and bot-like patterns
 */
function removeHardcodedPatterns(content) {
  if (!content) return content;
  
  // Remove repeated phrases that indicate AI generation
  const badPatterns = [
    /In conclusion,? [^.]*\./gi,
    /In summary,? [^.]*\./gi,
    /This (article|guide|post) has covered [^.]*\./gi,
    /We have covered [^.]*\./gi,
    /This is [^.]*important to note\./gi,
    /It is (important|crucial|essential) to [^.]*(understand|remember|note)[^.]*\./gi,
    /\[Note: [^\]]*\]/gi,
    /\{[^}]*\}/gi // Remove any {...} placeholders
  ];
  
  badPatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  
  return content;
}

/**
 * Remove special characters that don't belong in natural text
 */
function removeSpecialCharacters(content) {
  if (!content) return content;
  
  // Remove multiple dashes/underscores in a row
  content = content.replace(/[-_]{3,}/g, '');
  
  // Remove zero-width characters
  content = content.replace(/[\u200b\u200c\u200d\u200e\u200f\ufeff]/g, '');
  
  // Remove control characters except newlines and tabs
  content = content.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
  
  // Replace multiple exclamation/question marks with single
  content = content.replace(/[!?]{2,}/g, (match) => match[0]);
  
  return content;
}

/**
 * Ensure content starts with natural introduction
 */
function ensureNaturalStart(content, title) {
  if (!content) return content;
  
  const trimmed = content.trim();
  
  // If content starts with the title, remove it (it will be shown separately)
  if (trimmed.toLowerCase().startsWith(title.toLowerCase())) {
    content = trimmed.substring(title.length).trim();
  }
  
  return content;
}

/**
 * Main cleaning function
 */
async function cleanAllPosts() {
  try {
    console.log('🔍 Fetching all posts from database...\n');
    
    const result = await pool.query(
      'SELECT id, title, content FROM posts ORDER BY created_at DESC'
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No posts found in database');
      pool.end();
      return;
    }
    
    console.log(`✅ Found ${result.rows.length} posts to clean\n`);
    console.log('=' .repeat(80));
    
    let cleanedCount = 0;
    const postUpdates = [];
    
    for (const post of result.rows) {
      let originalLength = post.content.length;
      let content = post.content;
      let hasIssues = false;
      const issues = [];
      
      // Apply all cleaning functions
      if (content.includes('<') || content.includes('&')) {
        hasIssues = true;
        issues.push('HTML markup/entities');
        content = cleanHtmlMarkup(content);
        content = decodeHtmlEntities(content);
      }
      
      const beforeNormalize = content;
      content = normalizeWhitespace(content);
      if (beforeNormalize !== content) {
        hasIssues = true;
        issues.push('excessive whitespace');
      }
      
      const beforeHardcoded = content;
      content = removeHardcodedPatterns(content);
      if (beforeHardcoded !== content) {
        hasIssues = true;
        issues.push('hardcoded patterns');
      }
      
      const beforeSpecial = content;
      content = removeSpecialCharacters(content);
      if (beforeSpecial !== content) {
        hasIssues = true;
        issues.push('special characters');
      }
      
      content = ensureNaturalStart(content, post.title);
      
      if (hasIssues) {
        cleanedCount++;
        const newLength = content.length;
        
        console.log(`\n📝 Post #${post.id}: ${post.title}`);
        console.log(`   ✓ Removed: ${issues.join(', ')}`);
        console.log(`   📊 Length: ${originalLength} → ${newLength} characters`);
        
        postUpdates.push({
          id: post.id,
          content: content
        });
      }
    }
    
    if (postUpdates.length === 0) {
      console.log('\n✅ All posts are clean! No changes needed.');
      pool.end();
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n📤 Updating ${postUpdates.length} posts in database...\n`);
    
    // Update all posts in database
    let updatedCount = 0;
    for (const update of postUpdates) {
      try {
        await pool.query(
          'UPDATE posts SET content = $1, updated_at = NOW() WHERE id = $2',
          [update.content, update.id]
        );
        updatedCount++;
        console.log(`   ✅ Post #${update.id} updated`);
      } catch (err) {
        console.log(`   ❌ Post #${update.id} failed: ${err.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n✨ CLEANING COMPLETE!`);
    console.log(`   Total posts cleaned: ${updatedCount}/${postUpdates.length}`);
    console.log(`   Your posts are now humanized and AdSense-ready! 🎉\n`);
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

// Run the cleaning
cleanAllPosts();
