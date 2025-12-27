const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));
const modified = [];

files.forEach(file => {
  const fp = path.join(frontendDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  if (content.includes('id="article-schema"')) return;

  // Heuristic: only add to pages that have an <article> tag or an H1 and meta description
  const hasArticle = /<article[\s>]/i.test(content);
  const hasH1 = /<h1[^>]*>/.test(content);
  const hasMetaDesc = /<meta[^>]*name=["']description["'][^>]*>/i.test(content);
  if (!(hasArticle || (hasH1 && hasMetaDesc))) return;

  // Extract title text
  let titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : (file.replace('.html',''));
  // Extract meta description
  let descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  let description = descMatch ? descMatch[1].trim() : (title);

  const url = `https://tilana.online/${file}`;
  const logoUrl = 'https://tilana.online/images/logo.png';

  const json = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {"@type": "WebPage", "@id": url},
    "headline": title,
    "description": description,
    "author": {"@type": "Organization", "name": "Smart Money Guide"},
    "datePublished": new Date().toISOString().split('T')[0],
    "publisher": {"@type": "Organization", "name": "Smart Money Guide", "logo": {"@type": "ImageObject", "url": logoUrl}}
  };

  const scriptTag = `\n<script type="application/ld+json" id="article-schema">\n${JSON.stringify(json, null, 2)}\n</script>\n`;

  // Insert after meta description if present, else before </head>
  if (hasMetaDesc) {
    content = content.replace(/(<meta[^>]*name=["']description["'][^>]*>)/i, `$1${scriptTag}`);
  } else {
    content = content.replace(/<\/head>/i, `${scriptTag}</head>`);
  }

  fs.writeFileSync(fp, content, 'utf8');
  modified.push(file);
});

console.log('modified', modified.length);
modified.forEach(f => console.log(f));
