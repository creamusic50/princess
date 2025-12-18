#!/usr/bin/env node
/**
 * Quick test to verify health endpoint is working
 * This is what UptimeRobot will ping
 */

const http = require('http');
const https = require('https');

// Configuration
const SITE_URL = process.argv[2] || 'http://localhost:5000';
const ENDPOINT = '/_health';
const FULL_URL = `${SITE_URL}${ENDPOINT}`;

console.log('\n🧪 Testing Health Endpoint...\n');
console.log(`URL: ${FULL_URL}\n`);

const protocol = SITE_URL.startsWith('https') ? https : http;

const startTime = Date.now();

protocol.get(FULL_URL, (res) => {
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  console.log(`✅ STATUS: ${res.statusCode}`);
  console.log(`⏱️  RESPONSE TIME: ${responseTime}ms`);
  console.log(`📋 HEADERS:`, {
    'content-type': res.headers['content-type'],
    'cache-control': res.headers['cache-control'],
  });
  
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`📊 RESPONSE:`, json);
      
      // Validation
      if (json.status === 'ok') {
        console.log('\n✅ HEALTH CHECK PASSED!');
        console.log('✅ This endpoint is ready for UptimeRobot\n');
        process.exit(0);
      } else {
        console.log('\n❌ HEALTH CHECK FAILED - Bad status\n');
        process.exit(1);
      }
    } catch (e) {
      console.log('\n❌ Invalid JSON response:', data);
      process.exit(1);
    }
  });
  
}).on('error', (err) => {
  console.log(`❌ CONNECTION ERROR: ${err.message}\n`);
  console.log('Make sure:');
  console.log('1. Server is running');
  console.log('2. URL is correct');
  console.log('3. If using HTTPS, certificate is valid\n');
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('❌ REQUEST TIMEOUT - Server not responding\n');
  process.exit(1);
}, 10000);
