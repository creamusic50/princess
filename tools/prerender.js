#!/usr/bin/env node
// Simple prerender script that fetches homepage and posts and writes static HTML
// Usage: ensure backend server is running locally, then:
// node tools/prerender.js

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const OUT = path.join(__dirname, '..', 'frontend', 'prerender');
const API = process.env.PRERENDER_API || 'http://localhost:5000/api';

async function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

async function run() {
  await mkdirp(OUT);
  console.log('Fetching posts list...');
  const list = await fetchJson(`${API}/posts?page=1&limit=100`);
  if (!list.success) throw new Error('Failed to fetch posts');

  // Prerender index.html by copying current index and injecting server data
  const indexTemplate = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'index.html'), 'utf8');
  const indexOut = path.join(OUT, 'index.html');
  fs.writeFileSync(indexOut, indexTemplate, 'utf8');
  console.log('Wrote', indexOut);

  // Prerender each post to a file named by slug
  for (const post of list.posts) {
    try {
      const data = await fetchJson(`${API}/posts/${encodeURIComponent(post.slug)}`);
      if (!data.success) continue;
      const postHtml = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'post.html'), 'utf8');
      // Simple replacement: insert post content into the template's placeholder (post-container)
      const filled = postHtml.replace('<div id="post-container" class="post-content">\n                    <div class="loading" style="text-align: center; padding: 60px 20px; font-size: 18px; color: #3498db;">\n                        Loading article...\n                    </div>\n                </div>', `\n                <div id="post-container" class="post-content">\n${data.post.content}\n                </div>`);

      const outPath = path.join(OUT, `post-${post.slug}.html`);
      fs.writeFileSync(outPath, filled, 'utf8');
      console.log('Prerendered', outPath);
    } catch (e) {
      console.error('Failed to prerender', post.slug, e.message);
    }
  }

  console.log('\n✅ Prerender complete. Files written to frontend/prerender');
}

run().catch(e => console.error(e));
