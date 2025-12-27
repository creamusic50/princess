const fs = require('fs');
const path = require('path');

function stripTags(html){
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
             .replace(/<[^>]+>/g,' ')
             .replace(/\s+/g,' ').trim();
}

const frontendDir = path.join(__dirname, '..', 'frontend');
const files = fs.readdirSync(frontendDir)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(frontendDir, f));

const results = [];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const bodyMatch = content.match(/<body[\s\S]*<\/body>/i);
  const body = bodyMatch ? bodyMatch[0] : content;
  const text = stripTags(body);
  const words = text ? text.split(' ').filter(Boolean).length : 0;
  const metaDesc = /<meta[^>]*name=["']description["'][^>]*>/i.test(content);
  const hasArticleSchema = /id=["']article-schema["']/i.test(content);
  const headings = (content.match(/<h[1-6][^>]*>/gi) || []).length;
  results.push({
    file: path.basename(file),
    words,
    metaDesc,
    headings,
    hasArticleSchema
  });
});

// Print CSV
console.log('file,words,metaDescription,headings,articleSchema');
results.forEach(r => {
  console.log(`${r.file},${r.words},${r.metaDesc},${r.headings},${r.hasArticleSchema}`);
});
