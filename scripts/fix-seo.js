#!/usr/bin/env node

/**
 * SEO Fixer Script for Smart Money Guide
 * Standardizes all domain references, meta tags, and canonical URLs
 * 
 * Usage: node fix-seo.js [domain] [email]
 * Example: node fix-seo.js smartmoneyguide.com hello@smartmoneyguide.com
 */

const fs = require('fs');
const path = require('path');

// Configuration
const domain = process.argv[2] || 'smartmoneyguide.com';
const email = process.argv[3] || 'hello@smartmoneyguide.com';
const frontendDir = path.join(__dirname, '..', 'backend', 'frontend');

console.log('');
console.log('============================================================');
console.log('  🔍 SEO FIXER - Standardizing Domain References');
console.log('============================================================');
console.log(`  Primary Domain: ${domain}`);
console.log(`  Contact Email: ${email}`);
console.log('============================================================');
console.log('');

// 1. Fix robots.txt
console.log('[1/3] Fixing robots.txt...');
const robotsPath = path.join(frontendDir, 'robots.txt');
const robotsContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login.html
Disallow: /admin.html
Disallow: /admin-fixed.html
Disallow: /admin.htm
Disallow: /admin-OLD-BACKUP.html

Sitemap: https://${domain}/sitemap.xml`;

fs.writeFileSync(robotsPath, robotsContent);
console.log('✅ robots.txt updated\n');

// 2. Fix sitemap.xml
console.log('[2/3] Fixing sitemap.xml...');
const sitemapPath = path.join(frontendDir, 'sitemap.xml');
let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

// Replace all domain variations with correct domain
sitemapContent = sitemapContent.replace(/https:\/\/(tilana\.online|smartmoneyguide\.com|www\.smartmoneyguide\.com)/g, `https://${domain}`);

fs.writeFileSync(sitemapPath, sitemapContent);
console.log('✅ sitemap.xml updated\n');

// 3. Fix all HTML files
console.log('[3/3] Fixing HTML files...');

const htmlFiles = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));
let fixedCount = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(frontendDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Replace old domain references with new one
  content = content.replace(/https:\/\/(tilana\.online|smartmoneyguide\.com|www\.smartmoneyguide\.com)/g, `https://${domain}`);
  
  // Fix old email references
  content = content.replace(/hello@tilana\.online|hello@smartmoneyguide\.com/g, email);
  
  // Update canonical URLs to use correct domain
  content = content.replace(/<link rel="canonical"[^>]*href="[^"]*"/g, (match) => {
    // Extract the path from canonical
    const pathMatch = match.match(/href="https:\/\/[^/]*([^"]*)"/);
    if (pathMatch) {
      return `<link rel="canonical" href="https://${domain}${pathMatch[1]}"`;
    }
    return match;
  });

  // Only write if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
  }
});

console.log(`✅ ${fixedCount} HTML files updated\n`);

// Summary
console.log('============================================================');
console.log('  ✅ SEO FIX COMPLETE');
console.log('============================================================');
console.log('');
console.log('📋 What was fixed:');
console.log(`  ✓ robots.txt - Updated sitemap URL`);
console.log(`  ✓ sitemap.xml - Standardized all URLs`);
console.log(`  ✓ ${fixedCount} HTML files - Canonical tags, meta tags, schema`);
console.log('');
console.log('📝 Next steps:');
console.log('  1. Go to Google Search Console');
console.log('  2. Settings → Preferred domain → Select: ' + domain);
console.log('  3. Sitemaps → Submit: https://' + domain + '/sitemap.xml');
console.log('  4. URL Inspection → Paste homepage URL and request indexing');
console.log('');
console.log('🎯 Expected results in 1-2 weeks:');
console.log('  ✓ "Smart Money Guide" ranks higher in Google');
console.log('  ✓ Consistent domain in all search results');
console.log('  ✓ Better organic traffic');
console.log('');
console.log('============================================================');
console.log('');

