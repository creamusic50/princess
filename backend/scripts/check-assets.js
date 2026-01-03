const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const manifestPath = path.join(frontendDir, 'asset-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('asset-manifest.json not found at', manifestPath);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const files = Object.values(manifest);

const missing = [];
files.forEach((rel) => {
  const full = path.join(frontendDir, rel.replace(/^[\/]+/, ''));
  if (!fs.existsSync(full)) missing.push({ file: rel, full });
});

if (missing.length) {
  console.error('Missing static assets:');
  missing.forEach(m => console.error('- ', m.file, ' (', m.full, ')'));
  process.exit(1);
}

console.log('All static assets present (checked', files.length, 'items).');
process.exit(0);
