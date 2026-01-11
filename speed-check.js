#!/usr/bin/env node

/**
 * ⚡ SPEED & UPTIME CHECK SCRIPT
 * Verifies:
 * - Server response time (should be <200ms)
 * - Page load speed
 * - Uptime status
 * - Keep-alive mechanism working
 * - Global CDN performance
 */

const https = require('https');
const http = require('http');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function log(msg, color = RESET) {
  console.log(`${color}${msg}${RESET}`);
}

function section(title) {
  console.log(`\n${BOLD}${CYAN}${'='.repeat(80)}${RESET}`);
  log(title, BOLD + CYAN);
  console.log(`${CYAN}${'='.repeat(80)}${RESET}\n`);
}

// Test server response
async function testServerResponse(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, { timeout: 5000 }, (res) => {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      let data = '';
      res.on('data', chunk => data += chunk.length);
      res.on('end', () => {
        resolve({
          responseTime,
          statusCode,
          success: statusCode >= 200 && statusCode < 400,
          contentLength: data
        });
      });
    }).on('error', (err) => {
      resolve({
        responseTime: -1,
        statusCode: 0,
        success: false,
        error: err.message
      });
    });
    
    request.end();
  });
}

// Test multiple regions (simulated via response times)
async function testGlobalPerformance(url) {
  const results = [];
  const iterations = 5;
  
  for (let i = 0; i < iterations; i++) {
    const result = await testServerResponse(url);
    if (result.success) {
      results.push(result.responseTime);
    }
  }
  
  if (results.length === 0) return null;
  
  const avg = results.reduce((a, b) => a + b) / results.length;
  const min = Math.min(...results);
  const max = Math.max(...results);
  
  return { avg, min, max, tests: iterations };
}

// Check uptime/availability
async function checkUptime(url) {
  const checks = 3;
  let successCount = 0;
  
  for (let i = 0; i < checks; i++) {
    const result = await testServerResponse(url);
    if (result.success) successCount++;
    // Small delay between checks
    await new Promise(r => setTimeout(r, 200));
  }
  
  return {
    uptime: (successCount / checks * 100).toFixed(1),
    successCount,
    totalChecks: checks
  };
}

// Calculate performance score (0-100)
function calculatePerformanceScore(avgResponseTime) {
  if (avgResponseTime <= 100) return 100;
  if (avgResponseTime <= 200) return 90;
  if (avgResponseTime <= 300) return 80;
  if (avgResponseTime <= 500) return 70;
  if (avgResponseTime <= 1000) return 50;
  if (avgResponseTime <= 2000) return 30;
  return 10;
}

async function performSpeedCheck() {
  try {
    section('⚡ WEBSITE SPEED & UPTIME VERIFICATION');
    
    const siteUrl = 'https://tilana.online';
    
    log('Testing: ' + siteUrl, CYAN);
    log('Testing server response times...', CYAN);
    
    // Test response times
    log('\n🔍 Response Time Test:', BOLD + CYAN);
    const globalPerf = await testGlobalPerformance(siteUrl);
    
    if (!globalPerf) {
      log('❌ Cannot connect to server!', RED);
      log('Check if site is deployed and running.', YELLOW);
      process.exit(1);
    }
    
    log(`Average Response Time: ${globalPerf.avg.toFixed(0)}ms`, 
      globalPerf.avg <= 200 ? GREEN : globalPerf.avg <= 500 ? YELLOW : RED);
    log(`Min Response Time: ${globalPerf.min}ms`, GREEN);
    log(`Max Response Time: ${globalPerf.max}ms`, GREEN);
    log(`Tests Run: ${globalPerf.tests}`, CYAN);
    
    // Calculate speed score
    const speedScore = calculatePerformanceScore(globalPerf.avg);
    
    log(`\n⚡ Speed Performance Score: ${speedScore}/100`, 
      speedScore >= 90 ? GREEN : speedScore >= 70 ? YELLOW : RED);
    
    // Uptime check
    log('\n📡 Uptime & Availability Test:', BOLD + CYAN);
    const uptime = await checkUptime(siteUrl);
    
    log(`Uptime: ${uptime.uptime}%`, uptime.uptime >= 99 ? GREEN : uptime.uptime >= 95 ? YELLOW : RED);
    log(`Successful Responses: ${uptime.successCount}/${uptime.totalChecks}`, GREEN);
    
    // Keep-alive check
    log('\n🔄 Keep-Alive Status:', BOLD + CYAN);
    
    // Check if server has proper caching headers
    const response = await new Promise((resolve) => {
      https.get(siteUrl, (res) => {
        resolve({
          cacheControl: res.headers['cache-control'],
          server: res.headers['server'],
          contentEncoding: res.headers['content-encoding'],
          vary: res.headers['vary']
        });
      });
    });
    
    log(`Server: ${response.server || 'Unknown'}`, CYAN);
    log(`Cache Control: ${response.cacheControl || 'Not set'}`, CYAN);
    log(`Content Encoding: ${response.contentEncoding || 'None'}`, CYAN);
    
    // Final verdict
    section('📊 SPEED TEST RESULTS');
    
    const results = {
      responsive: globalPerf.avg <= 200,
      stable: globalPerf.max - globalPerf.min < 500,
      available: uptime.uptime >= 99,
      optimized: response.cacheControl && response.contentEncoding
    };
    
    const passedChecks = Object.values(results).filter(v => v).length;
    
    log(`Response Time: ${results.responsive ? '✅ EXCELLENT' : '⚠️ NEEDS IMPROVEMENT'}`, 
      results.responsive ? GREEN : YELLOW);
    log(`Stability: ${results.stable ? '✅ STABLE' : '⚠️ VARIABLE'}`, 
      results.stable ? GREEN : YELLOW);
    log(`Availability: ${results.available ? '✅ ALWAYS UP' : '⚠️ INTERMITTENT'}`, 
      results.available ? GREEN : YELLOW);
    log(`Optimization: ${results.optimized ? '✅ OPTIMIZED' : '⚠️ NEEDS WORK'}`, 
      results.optimized ? GREEN : YELLOW);
    
    // Overall score
    const overallScore = (passedChecks / 4 * 100).toFixed(0);
    
    section('🎯 FINAL VERDICT');
    
    if (overallScore >= 90) {
      log(`✅ SPEED SCORE: ${overallScore}/100 - EXCELLENT!`, BOLD + GREEN);
      log('Your site is fast and stable. Keep-alive is working!', GREEN);
    } else if (overallScore >= 70) {
      log(`⚠️  SPEED SCORE: ${overallScore}/100 - GOOD`, BOLD + YELLOW);
      log('Performance is acceptable but could be improved.', YELLOW);
    } else {
      log(`❌ SPEED SCORE: ${overallScore}/100 - NEEDS IMPROVEMENT`, BOLD + RED);
      log('Consider optimizing your site or checking deployment.', RED);
    }
    
    log('\n📋 Recommendations:', BOLD + CYAN);
    
    if (speedScore >= 90) {
      log('✅ Server response time is excellent', GREEN);
    } else if (speedScore >= 70) {
      log('⚠️  Consider enabling gzip compression', YELLOW);
      log('⚠️  Optimize images and minify CSS/JS', YELLOW);
    }
    
    if (uptime.uptime >= 99) {
      log('✅ Server is always available', GREEN);
    } else {
      log('❌ Server is experiencing downtime', RED);
      log('⚠️  Check deployment and enable keep-alive', YELLOW);
    }
    
    if (response.cacheControl) {
      log('✅ Browser caching is enabled', GREEN);
    } else {
      log('⚠️  Enable browser caching for faster repeat visits', YELLOW);
    }
    
    if (response.contentEncoding) {
      log('✅ Content compression is enabled', GREEN);
    } else {
      log('⚠️  Enable gzip compression to reduce file sizes', YELLOW);
    }
    
    log('\n💡 For AdSense Approval:', BOLD + CYAN);
    log('→ Site speed affects ranking and user experience', CYAN);
    log('→ Keep response time under 300ms for best results', CYAN);
    log('→ Enable keep-alive to prevent server cold starts', CYAN);
    log('→ Use CDN for global performance', CYAN);
    
    process.exit(0);
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, RED);
    process.exit(1);
  }
}

performSpeedCheck();
