#!/usr/bin/env node

/**
 * Quick Content Generation Setup
 * Generates professional content for all 27 finance blog posts
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 Finance Blog - Auto Content Generation 🚀           ║
║                                                                ║
║        Generate professional content for 27 posts             ║
║        Each 1000+ words - AdSense compliant                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Check if .env exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found in backend directory\n');
    console.log('Create .env with:');
    console.log('DATABASE_URL=postgresql://username:password@localhost:5432/finance_blog\n');
}

// Check if main script exists
const scriptPath = path.join(__dirname, 'auto-generate-content.js');
if (!fs.existsSync(scriptPath)) {
    console.log('❌ auto-generate-content.js not found\n');
    process.exit(1);
}

console.log('📝 About to generate content for your posts...\n');
console.log('Features:');
console.log('✅ 1000+ words per article (AdSense compliant)');
console.log('✅ Professional, published-ready content');
console.log('✅ Category-specific information');
console.log('✅ SEO-optimized structure');
console.log('✅ Saves time on content creation\n');

console.log('Categories covered:');
console.log('  • Saving Tips');
console.log('  • Investing');
console.log('  • Budgeting');
console.log('  • Retirement');
console.log('  • Credit Cards');
console.log('  • Money Management\n');

console.log('Ready? Press Ctrl+C to cancel, or run:\n');
console.log('  node backend/scripts/auto-generate-content.js\n');

console.log('═'.repeat(64));
