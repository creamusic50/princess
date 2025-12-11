#!/usr/bin/env node
// Image optimization script using sharp
// Generates resized WebP and AVIF variants for images under `frontend/images` and `backend/public/uploads`
// Usage: 
// 1) npm install sharp
// 2) node tools/optimize-images.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOTS = [
  path.join(__dirname, '..', 'frontend', 'images'),
  path.join(__dirname, '..', 'frontend', 'uploads'),
  path.join(__dirname, '..', 'backend', 'public', 'uploads')
];

const SIZES = [320, 640, 960, 1280];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
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

async function processImage(fp) {
  const ext = path.extname(fp).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;
  const dir = path.dirname(fp);
  const name = path.basename(fp, ext);

  for (const size of SIZES) {
    const outWebp = path.join(dir, `${name}-${size}.webp`);
    const outAvif = path.join(dir, `${name}-${size}.avif`);
    try {
      await sharp(fp).resize({ width: size }).webp({ quality: 80 }).toFile(outWebp);
      await sharp(fp).resize({ width: size }).avif({ quality: 50 }).toFile(outAvif);
      console.log(`✓ ${path.relative(process.cwd(), outWebp)}`);
      console.log(`✓ ${path.relative(process.cwd(), outAvif)}`);
    } catch (e) {
      console.error('Error processing', fp, e.message);
    }
  }
}

async function run() {
  for (const root of ROOTS) {
    const files = walk(root);
    for (const f of files) {
      await processImage(f);
    }
  }
  console.log('\n✅ Image optimization complete.');
}

run().catch(e => console.error(e));
