/**
 * 24/7 KEEP-ALIVE SERVICE FOR GOOGLE ADSENSE REVIEW
 * Prevents website from sleeping while Google reviews your blog
 * 
 * Usage: node keep-alive-service.js
 * This will run 24/7 and ping your website every 5 minutes
 */

const https = require('https');
const http = require('http');

// Configuration
const WEBSITE_URL = 'https://www.tilana.online/';
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TIMEOUT = 30000; // 30 seconds timeout
const START_TIME = new Date();

// Color codes for console
const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

console.log(`\n${colors.green}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.green}║  🚀 WEBSITE KEEP-ALIVE SERVICE - STARTED                  ║${colors.reset}`);
console.log(`${colors.green}║                                                            ║${colors.reset}`);
console.log(`${colors.green}║  Keeping website awake for Google AdSense review          ║${colors.reset}`);
console.log(`${colors.green}║  Ping interval: Every 5 minutes                           ║${colors.reset}`);
console.log(`${colors.green}║  Website: ${WEBSITE_URL}                    ║${colors.reset}`);
console.log(`${colors.green}║  Duration: 3 weeks (24/7)                                 ║${colors.reset}`);
console.log(`${colors.green}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

// Function to ping website
async function pingWebsite() {
    const currentTime = new Date().toLocaleTimeString();
    const uptime = calculateUptime();
    
    return new Promise((resolve) => {
        const protocol = WEBSITE_URL.startsWith('https') ? https : http;
        
        const request = protocol.get(WEBSITE_URL, {
            timeout: TIMEOUT,
            headers: {
                'User-Agent': 'Keep-Alive-Bot/1.0 (Google AdSense Review Protection)',
                'Cache-Control': 'no-cache'
            }
        }, (response) => {
            const statusCode = response.statusCode;
            const statusColor = statusCode >= 200 && statusCode < 300 ? colors.green : colors.yellow;
            
            console.log(`${statusColor}[${currentTime}] ✓ PING SUCCESS${colors.reset} | Status: ${statusCode} | Uptime: ${uptime}`);
            
            // Consume response data to free up memory
            response.on('data', () => {});
            response.on('end', () => {
                resolve({ success: true, status: statusCode });
            });
        });
        
        request.on('error', (error) => {
            console.log(`${colors.red}[${currentTime}] ✗ PING FAILED${colors.reset} | Error: ${error.message} | Uptime: ${uptime}`);
            resolve({ success: false, error: error.message });
        });
        
        request.on('timeout', () => {
            console.log(`${colors.red}[${currentTime}] ✗ TIMEOUT${colors.reset} | Request exceeded 30s | Uptime: ${uptime}`);
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
    const seconds = diff % 60;
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else {
        return `${minutes}m ${seconds}s`;
    }
}

// Main keep-alive loop
async function startKeepAlive() {
    console.log(`${colors.blue}Service is now running. Press Ctrl+C to stop.${colors.reset}\n`);
    
    // Initial ping
    await pingWebsite();
    
    // Schedule periodic pings
    setInterval(async () => {
        await pingWebsite();
    }, PING_INTERVAL);
    
    // Daily summary
    setInterval(() => {
        const uptime = calculateUptime();
        console.log(`\n${colors.blue}📊 DAILY SUMMARY - Uptime: ${uptime}${colors.reset}\n`);
    }, 24 * 60 * 60 * 1000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    const uptime = calculateUptime();
    console.log(`\n\n${colors.yellow}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.yellow}║  🛑 KEEP-ALIVE SERVICE STOPPED                             ║${colors.reset}`);
    console.log(`${colors.yellow}║  Total Uptime: ${uptime.padEnd(50)} ║${colors.reset}`);
    console.log(`${colors.yellow}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    process.exit(0);
});

// Start the service
startKeepAlive();
