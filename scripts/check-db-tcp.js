require('dotenv').config();
const net = require('net');
const dns = require('dns');
const { URL } = require('url');

const conn = process.env.DATABASE_URL || '';

if (!conn) {
  console.error('❌ DATABASE_URL not set in environment. Create a .env with DATABASE_URL and rerun.');
  process.exit(1);
}

let host, port;
try {
  // Ensure we can parse postgres-style URL
  const normalized = conn.replace(/^postgres:\/\//i, 'postgres://');
  const url = new URL(normalized);
  host = url.hostname;
  port = url.port ? parseInt(url.port, 10) : 5432;
} catch (err) {
  console.error('❌ Error parsing DATABASE_URL:', err.message);
  process.exit(1);
}

console.log('🔎 Checking DB host reachability');
console.log('   Host:', host);
console.log('   Port:', port);

dns.lookup(host, (err, address) => {
  if (err) {
    console.error('❌ DNS lookup failed for host:', host, '-', err.message);
  } else {
    console.log('✅ DNS resolved:', address);
  }

  const socket = new net.Socket();
  const timeoutMs = 5000;
  let finished = false;

  socket.setTimeout(timeoutMs);

  socket.on('connect', () => {
    finished = true;
    console.log(`✅ TCP connect successful to ${host}:${port}`);
    socket.destroy();
    process.exit(0);
  });

  socket.on('timeout', () => {
    if (finished) return;
    finished = true;
    console.error(`❌ TCP connect timed out after ${timeoutMs}ms`);
    socket.destroy();
    process.exit(2);
  });

  socket.on('error', (e) => {
    if (finished) return;
    finished = true;
    console.error('❌ TCP connect error:', e.message);
    socket.destroy();
    process.exit(3);
  });

  socket.connect(port, host);
});
