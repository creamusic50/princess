#!/usr/bin/env node
// Usage: node list-admin-posts.js <ADMIN_TOKEN>
// Or set ADMIN_TOKEN env var

const token = process.argv[2] || process.env.ADMIN_TOKEN;
if (!token) {
  console.error('Usage: node list-admin-posts.js <ADMIN_TOKEN> (or set ADMIN_TOKEN env var)');
  process.exit(1);
}

const API = 'http://localhost:5000/api/admin/posts?page=1&limit=200';

(async () => {
  try {
    const res = await fetch(API, { headers: { 'x-auth-token': token } });
    if (!res.ok) {
      const txt = await res.text();
      console.error('Request failed:', res.status, txt);
      process.exit(2);
    }
    const data = await res.json();
    if (!data.success) {
      console.error('API error:', data);
      process.exit(2);
    }

    const posts = data.posts || [];
    if (!posts.length) {
      console.log('No posts returned.');
      process.exit(0);
    }

    posts.forEach(p => {
      console.log(`${p.id}\t${p.published ? 'P' : 'D'}\t${p.title}`);
    });
  } catch (e) {
    console.error('Error fetching admin posts:', e);
    process.exit(3);
  }
})();
