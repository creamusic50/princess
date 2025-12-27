const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));
const modified = [];

files.forEach(file => {
  const fp = path.join(frontendDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  if (!content.includes('id="article-schema"')) return;

  // Extract script content
  const scriptRegex = /<script[^>]*id=["']article-schema["'][^>]*>([\s\S]*?)<\/script>/i;
  const match = content.match(scriptRegex);
  if (!match) return;
  let jsonText = match[1].trim();
  // Try parse JSON
  let json = null;
  try {
    json = JSON.parse(jsonText);
  } catch (e) {
    // If script is empty or invalid, create base JSON
    json = {
      "@context": "https://schema.org",
      "@type": "Article"
    };
  }

  // Add datePublished if missing using file mtime
  if (!json.datePublished) {
    const stat = fs.statSync(fp);
    const mtime = stat.mtime.toISOString().split('T')[0];
    json.datePublished = mtime;
  }

  // Add image if missing: find first <img src=> in body
  if (!json.image) {
    const imgMatch = content.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (imgMatch) {
      let imgUrl = imgMatch[1];
      if (!imgUrl.startsWith('http')) {
        imgUrl = 'https://tilana.online/' + imgUrl.replace(/^\//, '');
      }
      json.image = imgUrl;
    }
  }

  // Ensure publisher.logo exists
  if (json.publisher && json.publisher.logo) {
    // ok
  } else if (json.publisher) {
    json.publisher.logo = {"@type":"ImageObject","url":"https://tilana.online/images/logo.png"};
  } else {
    json.publisher = {"@type":"Organization","name":"Smart Money Guide","logo":{"@type":"ImageObject","url":"https://tilana.online/images/logo.png"}};
  }

  // Replace script content with updated JSON
  const newScript = `<script type=\"application/ld+json\" id=\"article-schema\">\n${JSON.stringify(json, null, 2)}\n</script>`;
  content = content.replace(scriptRegex, newScript);

  // Add canonical link if missing
  if (!/rel=["']canonical["']/i.test(content)) {
    const canonical = `<link rel=\"canonical\" href=\"https://tilana.online/${file}\">`;
    // insert before </head>
    content = content.replace(/<\/head>/i, canonical + '\n</head>');
  }

  fs.writeFileSync(fp, content, 'utf8');
  modified.push(file);
});

console.log('modified', modified.length);
modified.forEach(f => console.log(f));
