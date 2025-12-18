// Keep-Alive Ping Service
// Prevents server from sleeping on Render.com or similar platforms

const http = require('http');
const https = require('https');

// Your website URL (update this based on your actual Render URL)
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://your-site.onrender.com';
const PING_INTERVAL = process.env.PING_INTERVAL || 300000; // 5 minutes default

// Ping the website to keep it awake
function pingWebsite() {
  const protocol = WEBSITE_URL.startsWith('https') ? https : http;
  const url = WEBSITE_URL.includes('/api') ? WEBSITE_URL : `${WEBSITE_URL}/`;

  protocol.get(url, (res) => {
    console.log(`[${new Date().toISOString()}] Ping successful - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Ping failed:`, err.message);
  });
}

// Start pinging immediately and then every PING_INTERVAL
console.log(`🔄 Keep-Alive Service Started`);
console.log(`⏰ Pinging ${WEBSITE_URL} every ${PING_INTERVAL / 1000} seconds`);
console.log(`📍 Time: ${new Date().toISOString()}`);

pingWebsite(); // Ping immediately
setInterval(pingWebsite, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Keep-Alive service shutting down...');
  process.exit(0);
});
