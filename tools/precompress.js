#!/usr/bin/env node
/**
 * Pre-compress static assets (JS, CSS, HTML, SVG, JSON, WASM) into .br and .gz variants.
 * These compressed files are served by Express when the client supports the encoding.
 * Usage: node tools/precompress.js [directory]
 * Example: node tools/precompress.js ./frontend
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = process.argv[2] || path.join(__dirname, '..', 'frontend');
const exts = ['.js', '.css', '.html', '.svg', '.json', '.wasm'];

let compressed = 0;
let errors = 0;

function walk(dir) {
  try {
    for (const name of fs.readdirSync(dir)) {
      try {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        
        if (stat.isDirectory()) {
          walk(full);
        } else if (stat.isFile()) {
          const ext = path.extname(full).toLowerCase();
          
          if (exts.includes(ext)) {
            const size = stat.size;
            
            // Create gzip version
            try {
              const gzPath = full + '.gz';
              const gz = zlib.createGzip({ level: 9 });
              fs.createReadStream(full)
                .pipe(gz)
                .pipe(fs.createWriteStream(gzPath));
              console.log(`✓ gzip: ${path.relative(root, full)} (${size} bytes)`);
            } catch (e) {
              console.error(`✗ gzip failed for ${full}:`, e.message);
              errors++;
            }
            
            // Create brotli version
            try {
              const brPath = full + '.br';
              const br = zlib.createBrotliCompress({
                params: {
                  [zlib.constants.BROTLI_PARAM_QUALITY]: 11
                }
              });
              fs.createReadStream(full)
                .pipe(br)
                .pipe(fs.createWriteStream(brPath));
              console.log(`✓ brotli: ${path.relative(root, full)} (${size} bytes)`);
            } catch (e) {
              console.error(`✗ brotli failed for ${full}:`, e.message);
              errors++;
            }
            
            compressed += 2; // 1 gzip + 1 brotli
          }
        }
      } catch (e) {
        console.error(`Error processing ${name}:`, e.message);
        errors++;
      }
    }
  } catch (e) {
    console.error(`Error walking directory ${dir}:`, e.message);
  }
}

console.log(`\n📦 Pre-compressing static assets in: ${path.resolve(root)}\n`);
walk(path.resolve(root));

console.log(`\n✅ Compression complete!`);
console.log(`   📊 Total files processed: ${compressed / 2}`);
console.log(`   📦 Total variants created: ${compressed} (.gz + .br)`);
if (errors > 0) {
  console.log(`   ⚠️  Errors: ${errors}`);
}
console.log(`\n💡 Tip: The server will now serve these pre-compressed files to clients that support the encoding.\n`);
