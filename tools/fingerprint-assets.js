#!/usr/bin/env node
// Simple asset fingerprinting script
// - Walks `frontend` directory, creates fingerprinted copies for .js/.css/.png/.jpg/.jpeg/.webp/.woff2
// - Rewrites HTML references to use the fingerprinted filenames
// Usage: node tools/fingerprint-assets.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', 'frontend');
const ASSET_EXTS = new Set(['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.woff2', '.woff']);

function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha1').update(data).digest('hex').slice(0, 8);
  return hash;
}

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat && stat.isDirectory()) {
      results.push(...walk(fp));
    } else {
      results.push(fp);
    }
  });
  return results;
}

function fingerprint() {
  console.log('🔎 Scanning frontend for assets...');
  const files = walk(ROOT);
  const mapping = {};

  files.forEach(fp => {
    const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
    const ext = path.extname(fp).toLowerCase();
    if (!ASSET_EXTS.has(ext)) return;

    const h = hashFile(fp);
    const dir = path.dirname(fp);
    const base = path.basename(fp, ext);
    const newName = `${base}.${h}${ext}`;
    const newPath = path.join(dir, newName);

    // Copy file to new fingerprinted filename
    fs.copyFileSync(fp, newPath);
    mapping[rel] = path.relative(ROOT, newPath).replace(/\\/g, '/');
    console.log(`✓ ${rel} -> ${mapping[rel]}`);
  });

  // Update HTML files to point to fingerprinted assets
  console.log('\n🔧 Updating HTML and JS references...');
  const htmlAndJs = files.filter(f => f.endsWith('.html') || f.endsWith('.js'));
  htmlAndJs.forEach(fp => {
    let content = fs.readFileSync(fp, 'utf8');
    let updated = content;

    Object.keys(mapping).forEach(orig => {
      const escaped = orig.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const re = new RegExp(escaped, 'g');
      updated = updated.replace(re, mapping[orig]);
    });

    if (updated !== content) {
      fs.writeFileSync(fp, updated, 'utf8');
      console.log(`Updated references in: ${path.relative(ROOT, fp)}`);
    }
  });

  // Write mapping file
  const mapPath = path.join(ROOT, 'asset-manifest.json');
  fs.writeFileSync(mapPath, JSON.stringify(mapping, null, 2), 'utf8');
  console.log(`\n✅ Fingerprinting complete. Manifest saved to frontend/asset-manifest.json`);
}

fingerprint();
