const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Trust proxy for proper IP detection behind reverse proxies
app.set('trust proxy', 1);

// Disable compression - files are already minified, causing decode errors on Render
// app.use(compression({...}));

// Enhanced Security Headers for AdSense - FIXED CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://pagead2.googlesyndication.com",
        "https://adservice.google.com",
        "https://googleads.g.doubleclick.net",
        "https://www.googletagservices.com",
        "https://tpc.googlesyndication.com",
        "https://www.google.com",
        "https://cdn.jsdelivr.net",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com"
      ],
      scriptSrcElem: [
        "'self'", 
        "'unsafe-inline'", 
        "https://pagead2.googlesyndication.com",
        "https://adservice.google.com",
        "https://googleads.g.doubleclick.net",
        "https://www.googletagservices.com",
        "https://tpc.googlesyndication.com",
        "https://www.google.com",
        "https://cdn.jsdelivr.net",
        "https://www.google-analytics.com",
        "https://*.adtrafficquality.google",
        "https://ep2.adtrafficquality.google"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://www.googletagservices.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com", 
        "data:"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "http:",
        "https://pagead2.googlesyndication.com",
        "https://www.google.com",
        "https://googleads.g.doubleclick.net",
        "https://tpc.googlesyndication.com"
      ],
      connectSrc: [
        "'self'", 
        "https://pagead2.googlesyndication.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://googleads.g.doubleclick.net",
        "https://adservice.google.com",
        "https://*.adtrafficquality.google",
        "https://ep1.adtrafficquality.google",
        "https://www.google.com",
        "https://securepubads.g.doubleclick.net",
        "https://partner.googleadservices.com"
      ],
      frameSrc: [
        "https://pagead2.googlesyndication.com",
        "https://googleads.g.doubleclick.net",
        "https://tpc.googlesyndication.com",
        "https://www.google.com",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        "https://td.doubleclick.net",
        "https://securepubads.g.doubleclick.net"
      ],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));

// Performance Headers for Maximum Speed
app.use((req, res, next) => {
  // Enable HTTP/2 Server Push hints
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Link', [
      '</css/style.min.f5f26ea4.css>; rel=preload; as=style',
      '</css/responsive.min.c014bbda.css>; rel=preload; as=style',
      '</js/config.min.f841bc00.js>; rel=preload; as=script',
      '</js/main.min.eb2549f5.js>; rel=preload; as=script'
    ].join(', '));
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Server-Timing', 'cache;dur=20');
  
  next();
});

// Request logging in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(cors());

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes - These take priority
const postsRouter = require('./routes/posts');
const categoriesRouter = require('./routes/categories');
const authRouter = require('./routes/auth');
const contactRouter = require('./routes/contact');
const metaRouter = require('./routes/meta');
const uploadRouter = require('./routes/upload');
const adminRouter = require('./routes/admin');

app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/meta', metaRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Robots.txt with proper headers
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'frontend', 'robots.txt'));
});

// Sitemap with proper headers
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'frontend', 'sitemap.xml'));
});

// Ads.txt for AdSense
app.get('/ads.txt', (req, res) => {
  res.type('text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'frontend', 'ads.txt'));
});

// Serve static files from frontend directory with aggressive caching
const frontendPath = path.join(__dirname, 'frontend');
console.log('📁 Serving frontend from:', frontendPath);

// Static file serving with optimized cache headers
app.use(express.static(frontendPath, {
  maxAge: '0', // We'll set this per-file type
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // HTML files - no cache (always fresh)
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // CSS and JS - long cache (versioned files)
    else if (filePath.match(/\.(css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Fonts - long cache
    else if (filePath.match(/\.(woff2?|ttf|eot|otf)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    // Images - medium cache
    else if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
    }
    // JSON and XML - short cache
    else if (filePath.match(/\.(json|xml)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
  }
}));

// Service Worker with proper headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(frontendPath, 'sw.js'));
});

// Explicit routes for specific HTML files
app.get('/admin.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/admin', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/login.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(frontendPath, 'login.html'));
});

app.get('/post.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(frontendPath, 'post.html'));
});

// Catch-all route for SPA routing (must be last)
app.get('*', (req, res) => {
  // If it's an API route that wasn't matched, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      message: 'API endpoint not found' 
    });
  }

  // For all other routes, serve index.html
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Performance: Optimized for 100/100 scores`);
  console.log(`🎯 AdSense: CSP Fixed - Ads Ready!`);
  console.log(`🌐 Domain: tilana.online`);
  console.log('===========================================');

  // Auto-ping to keep Render free tier awake (prevents sleep after 15 min inactivity)
  if (process.env.NODE_ENV === 'production') {
    const PING_INTERVAL = parseInt(process.env.PING_INTERVAL) || 840000; // 14 minutes default
    const WEBSITE_URL = process.env.WEBSITE_URL || 'https://tilana.online';
    
    setInterval(async () => {
      try {
        const https = require('https');
        const http = require('http');
        
        const protocol = WEBSITE_URL.startsWith('https') ? https : http;
        protocol.get(WEBSITE_URL, (res) => {
          if (res.statusCode === 200) {
            console.log(`✅ [${new Date().toISOString()}] Keep-alive ping successful - Server awake`);
          }
        }).on('error', (err) => {
          console.log(`⚠️ [${new Date().toISOString()}] Keep-alive ping error:`, err.message);
        });
      } catch (error) {
        console.log(`⚠️ Keep-alive ping failed:`, error.message);
      }
    }, PING_INTERVAL);
    
    console.log(`⏰ Auto-ping enabled: Every ${(process.env.PING_INTERVAL || 840000) / 1000 / 60} minutes`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
