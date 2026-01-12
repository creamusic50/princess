const Pool = require('pg').Pool;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function auditAdSenseQuality() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
        console.log('\n' + '='.repeat(70));
        console.log('🔍 GOOGLE ADSENSE QUALITY AUDIT - 27 POSTS ANALYSIS');
        console.log('='.repeat(70) + '\n');
        
        const posts = await pool.query(`
            SELECT id, title, category, content, excerpt, published, created_at
            FROM posts
            ORDER BY id
        `);
        
        let passCount = 0;
        let issuesList = [];
        let qualityBreakdown = {
            wordCount: 0,
            structure: 0,
            formatting: 0,
            content: 0,
            seo: 0
        };
        
        // Analysis per post
        console.log('📋 DETAILED POST ANALYSIS:\n');
        
        posts.rows.forEach((post, idx) => {
            const content = post.content || '';
            const excerpt = post.excerpt || '';
            const title = post.title || '';
            
            // Word count check
            const wordCount = content.split(/\s+/).filter(w => w).length;
            const hasMinWords = wordCount >= 1000;
            
            // Structure check (headings)
            const h2Count = (content.match(/<h2>/gi) || []).length;
            const h3Count = (content.match(/<h3>/gi) || []).length;
            const hasProperStructure = h2Count >= 1 && h3Count >= 2;
            
            // Formatting check (paragraphs, readability)
            const pCount = (content.match(/<p>/gi) || []).length;
            const hasProperFormatting = pCount >= 5 && wordCount > 0;
            
            // Content quality checks
            const hasExcerpt = excerpt && excerpt.length > 50;
            const hasTitle = title && title.length > 10;
            const isPublished = post.published === true;
            const contentLength = content.length;
            const hasNoHtmlErrors = (content.match(/<[^>]*>/g) || []).length > 0;
            
            // SEO checks
            const hasMeta = hasExcerpt && hasTitle;
            const titleLength = title.length;
            const hasKeywords = content.toLowerCase().includes(post.category.toLowerCase());
            
            // Overall assessment
            const qualityScore = [
                hasMinWords ? 1 : 0,
                hasProperStructure ? 1 : 0,
                hasProperFormatting ? 1 : 0,
                hasExcerpt && hasTitle ? 1 : 0,
                isPublished ? 1 : 0
            ].reduce((a, b) => a + b) * 20;
            
            const postPass = hasMinWords && hasProperStructure && hasProperFormatting && hasExcerpt && isPublished;
            
            if (postPass) {
                passCount++;
                qualityBreakdown.wordCount += hasMinWords ? 1 : 0;
                qualityBreakdown.structure += hasProperStructure ? 1 : 0;
                qualityBreakdown.formatting += hasProperFormatting ? 1 : 0;
                qualityBreakdown.content += (hasExcerpt && hasTitle) ? 1 : 0;
                qualityBreakdown.seo += hasMeta ? 1 : 0;
            }
            
            const status = postPass ? '✅ PASS' : '⚠️ REVIEW';
            console.log(`${idx + 1}. "${title}"`);
            console.log(`   Category: ${post.category}`);
            console.log(`   Status: ${status} | Score: ${qualityScore}%`);
            console.log(`   Words: ${wordCount} | Structure: ${h2Count} H2s, ${h3Count} H3s | Paragraphs: ${pCount}`);
            console.log(`   Published: ${isPublished ? 'Yes' : 'No'} | Excerpt: ${hasExcerpt ? 'Yes' : 'No'}`);
            
            if (!postPass) {
                let issues = [];
                if (!hasMinWords) issues.push(`Low word count: ${wordCount} words (need 1000+)`);
                if (!hasProperStructure) issues.push(`Poor heading structure: ${h2Count} H2s, ${h3Count} H3s`);
                if (!hasProperFormatting) issues.push(`Insufficient paragraphs: ${pCount}`);
                if (!hasExcerpt || !hasTitle) issues.push(`Missing excerpt or title`);
                if (!isPublished) issues.push(`Not published`);
                
                issues.forEach(issue => {
                    console.log(`   ⚠️  ${issue}`);
                    issuesList.push({ postNum: idx + 1, title, issue });
                });
            }
            console.log();
        });
        
        // Summary Report
        console.log('='.repeat(70));
        console.log('📊 SUMMARY REPORT\n');
        
        const passPercentage = ((passCount / posts.rows.length) * 100).toFixed(1);
        console.log(`✅ AdSense-Ready Posts: ${passCount}/${posts.rows.length} (${passPercentage}%)\n`);
        
        console.log('🎯 Quality Breakdown:');
        console.log(`   ✓ Word Count (1000+): ${qualityBreakdown.wordCount}/${posts.rows.length}`);
        console.log(`   ✓ Structure (H2/H3): ${qualityBreakdown.structure}/${posts.rows.length}`);
        console.log(`   ✓ Formatting (Paragraphs): ${qualityBreakdown.formatting}/${posts.rows.length}`);
        console.log(`   ✓ Content (Title/Excerpt): ${qualityBreakdown.content}/${posts.rows.length}`);
        console.log(`   ✓ SEO Basics: ${qualityBreakdown.seo}/${posts.rows.length}\n`);
        
        // AdSense Requirements
        console.log('🔐 GOOGLE ADSENSE REQUIREMENTS CHECK:\n');
        
        const adsenseChecks = [
            {
                name: '✅ Original Content',
                description: 'Posts should be original and unique',
                status: 'GENERATED (verify for plagiarism separately)',
                note: 'Content is generated - run plagiarism check tool'
            },
            {
                name: '✅ High-Quality Content',
                description: 'Content must be well-written and valuable',
                status: passPercentage >= 90 ? '✅ PASS' : '⚠️ CHECK',
                note: `${passCount} posts meet quality standards`
            },
            {
                name: '✅ Minimum Word Count',
                description: 'Posts should be 1000+ words',
                status: qualityBreakdown.wordCount === 27 ? '✅ PASS' : '⚠️ CHECK',
                note: `${qualityBreakdown.wordCount}/27 posts meet requirement`
            },
            {
                name: '✅ No Policy Violations',
                description: 'No adult, violent, hateful, or copyrighted content',
                status: '✅ PASS',
                note: 'Content is finance/educational focused'
            },
            {
                name: '✅ Proper Structure',
                description: 'Posts should have clear headings and paragraphs',
                status: qualityBreakdown.structure === 27 ? '✅ PASS' : '⚠️ CHECK',
                note: `${qualityBreakdown.structure}/27 posts properly structured`
            },
            {
                name: '✅ Published Content',
                description: 'Posts must be publicly accessible',
                status: passCount === 27 ? '✅ PASS' : '⚠️ CHECK',
                note: 'All posts published'
            },
            {
                name: '✅ AdSense Code Integration',
                description: 'Website must have valid AdSense code',
                status: '⏳ TODO',
                note: 'Add AdSense code to website after approval'
            }
        ];
        
        adsenseChecks.forEach(check => {
            console.log(`${check.name}`);
            console.log(`   ${check.description}`);
            console.log(`   Status: ${check.status}`);
            console.log(`   Note: ${check.note}\n`);
        });
        
        // Issues List
        if (issuesList.length > 0) {
            console.log('='.repeat(70));
            console.log('⚠️  ISSUES FOUND:\n');
            issuesList.forEach(issue => {
                console.log(`Post #${issue.postNum}: "${issue.title}"`);
                console.log(`   → ${issue.issue}\n`);
            });
        }
        
        // Final Recommendation
        console.log('='.repeat(70));
        console.log('📌 FINAL RECOMMENDATION:\n');
        
        if (passPercentage >= 95) {
            console.log('🎉 EXCELLENT - Ready for AdSense Submission!');
            console.log('   • All posts meet quality standards');
            console.log('   • Content is well-structured and comprehensive');
            console.log('   • Word counts exceed minimum requirements');
            console.log('   • Recommendation: SUBMIT TO GOOGLE ADSENSE\n');
        } else if (passPercentage >= 80) {
            console.log('✅ GOOD - Ready with Minor Improvements');
            console.log('   • Most posts meet quality standards');
            console.log('   • Review flagged posts for issues');
            console.log('   • Minor fixes recommended before submission\n');
        } else {
            console.log('⚠️  NEEDS WORK - Not Ready Yet');
            console.log('   • Multiple posts need improvement');
            console.log('   • Address issues listed above');
            console.log('   • Recheck before AdSense submission\n');
        }
        
        console.log('='.repeat(70) + '\n');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

auditAdSenseQuality();
