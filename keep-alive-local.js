/**
 * LOCAL KEEP-ALIVE SERVICE - NO EXTERNAL MONITORING
 * Runs on your computer - keeps website awake without external impact
 * 
 * ADVANTAGES over UptimeRobot:
 * - No external service affecting performance
 * - Completely local - you control everything
 * - Silent background operation
 * - Can be paused anytime
 * - Free forever
 * 
 * How to run:
 * 1. Open PowerShell as Administrator
 * 2. Run: node d:\finance-blog\keep-alive-local.js
 * 3. Let it run 24/7 for 3 weeks
 * 4. That's it!
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const WEBSITE_URL = 'https://www.tilana.online/';
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TIMEOUT = 15000; // 15 seconds (faster, lighter)
const LOG_FILE = path.join(__dirname, 'keep-alive.log');
const START_TIME = new Date();

// Initialize log file
function log(message) {
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    
    // Append to log file
    fs.appendFile(LOG_FILE, logMessage, (err) => {
        if (err) console.error('Log write error:', err);
    });
}

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         🚀 LOCAL KEEP-ALIVE SERVICE STARTED                   ║
║                                                                ║
║    Keeping your website awake for Google AdSense review      ║
║    Duration: 3 weeks (24/7)                                  ║
║    Website: ${WEBSITE_URL}                    ║
║    Update interval: 5 minutes (lightweight)                  ║
║                                                                ║
║    Performance Impact: MINIMAL ✓                             ║
║    (pings from your local computer)                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

log('✓ Keep-Alive Service Started');
log(`✓ Website: ${WEBSITE_URL}`);
log(`✓ Ping interval: 5 minutes`);
log(`✓ Timeout: 15 seconds`);
log('✓ This service is completely local - no performance impact');

// Function to ping website (lightweight)
async function pingWebsite() {
    return new Promise((resolve) => {
        const protocol = WEBSITE_URL.startsWith('https') ? https : http;
        const startTime = Date.now();
        
        const request = protocol.get(WEBSITE_URL, {
            timeout: TIMEOUT,
            headers: {
                'User-Agent': 'Local-Keep-Alive/1.0',
                'Cache-Control': 'no-cache',
                'Connection': 'close' // Close connection immediately after
            }
        }, (response) => {
            const duration = Date.now() - startTime;
            const statusCode = response.statusCode;
            const uptime = calculateUptime();
            
            // Log success
            log(`✓ PING OK | Status: ${statusCode} | Time: ${duration}ms | Uptime: ${uptime}`);
            
            // Consume response data quickly and discard
            response.on('data', () => {});
            response.on('end', () => {
                resolve({ success: true, status: statusCode, duration });
            });
        });
        
        request.on('error', (error) => {
            const uptime = calculateUptime();
            log(`⚠ PING ERROR | Error: ${error.message} | Uptime: ${uptime}`);
            resolve({ success: false, error: error.message });
        });
        
        request.on('timeout', () => {
            const uptime = calculateUptime();
            log(`⚠ TIMEOUT | Uptime: ${uptime}`);
            request.destroy();
            resolve({ success: false, error: 'Timeout' });
        });
    });
}

// Calculate uptime
function calculateUptime() {
    const now = new Date();
    const diff = Math.floor((now - START_TIME) / 1000);
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Main keep-alive loop
async function startKeepAlive() {
    log('✓ Service is running. Press Ctrl+C to stop.');
    
    // Initial ping
    await pingWebsite();
    
    // Schedule periodic pings
    setInterval(async () => {
        await pingWebsite();
    }, PING_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    const uptime = calculateUptime();
    log(`✓ Service stopped. Total uptime: ${uptime}`);
    console.log(`\n✓ Keep-Alive service stopped after ${uptime}\n`);
    process.exit(0);
});

// Handle errors
process.on('uncaughtException', (error) => {
    log(`✗ ERROR: ${error.message}`);
    console.error('Error:', error);
});

// Start the service
startKeepAlive();
