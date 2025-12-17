const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');

function compressFile(src, dest, method) {
  return new Promise((resolve, reject) => {
    const inp = fs.createReadStream(src);
    const out = fs.createWriteStream(dest);
    let stream;
    if (method === 'gzip') stream = zlib.createGzip({ level: zlib.constants.Z_BEST_COMPRESSION });
    else if (method === 'brotli') stream = zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } });
    else return reject(new Error('Unknown method'));

    pipeline(inp, stream, out, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function walkAndCompress(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkAndCompress(full);
      continue;
    }

    // Skip already compressed files and images
    if (full.endsWith('.br') || full.endsWith('.gz')) continue;
    if (/\.(png|jpg|jpeg|webp|avif|gif|mp4|mov|zip|rar)$/.test(full)) continue;

    // Only compress text-like assets
    if (/\.(js|css|html|svg|json|txt|xml|map)$/.test(full)) {
      try {
        await compressFile(full, full + '.gz', 'gzip');
        await compressFile(full, full + '.br', 'brotli');
        console.log('Compressed', full);
      } catch (e) {
        console.error('Failed to compress', full, e);
      }
    }
  }
}

const target = process.argv[2] || path.join(__dirname, '..', 'backend', 'frontend');
console.log('Precompressing files under', target);
walkAndCompress(target).then(() => console.log('Precompression complete')).catch(err => { console.error(err); process.exit(1); });
