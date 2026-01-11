const express = require('express');
const path = require('path');
// Load environment variables from project root .env when running backend directly
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const compression = require('compression');
const helmet = require('helmet');
const expressStaticGzip = require('express-static-gzip');

const app = express();

// Basic middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable compression with optimal settings for 100/100 performance
app.use(compression({
  level: 9,  // Maximum compression for best performance
  threshold: 0,  // Compress all responses, even small ones
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Don't compress images, fonts, or already-compressed files
    const contentType = res.getHeader('content-type');
    if (!contentType) return true;
    if (contentType.includes('image') || contentType.includes('font') || 
        contentType.includes('woff') || contentType.includes('woff2')) {
      return false;
    }
    return true;
  }
}));

// Security headers - CSP and helmet completely disabled for ad compatibility
// Only use specific security headers, no CSP
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

// Enhanced performance headers for Core Web Vitals (100/100 Desktop Optimized)
app.use((req, res, next) => {
  // Explicitly remove CSP to allow Google ads
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Content-Security-Policy-Report-Only');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Performance optimization headers
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Critical for Core Web Vitals and crawlability
  res.setHeader('Vary', 'Accept-Encoding');
  
  // Allow Google and other search engines to crawl
  res.setHeader('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  
  // Performance: Preconnect hints for critical origins
  res.setHeader('Link', [
    '<https://fonts.googleapis.com>; rel=preconnect',
    '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
    '<https://pagead2.googlesyndication.com>; rel=preconnect'
  ].join(', '));
  
  // Add timing headers for performance monitoring
  res.setHeader('Server-Timing', 'db;dur=10, cache;dur=20');
  
  // CRITICAL: Set caching headers for maximum performance
  // Static assets - aggressive caching
  if (req.path.match(/\.(js|css|woff|woff2|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // HTML files - no cache to always get latest
  else if (req.path === '/sw.js' || req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  // API endpoints - short cache
  else if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute cache
  }
  // Default - medium cache
  else {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
  }
  
  next();
});

// Simple health check for keep-alive services (must be before other routes)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Robots.txt - Allow Google to crawl everything
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /api/

Sitemap: https://tilana.online/sitemap.xml

# Crawl-delay: 1
# Request-rate: 30/1m`);
});

// Sitemap.xml enhancement - Add proper caching and headers
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  // Sitemap will be served from frontend folder with proper mime type
  res.sendFile(path.join(__dirname, 'frontend', 'sitemap.xml'));
});

// Mount API routes from repository root
const postsRouter = require('./routes/posts');
const categoriesRouter = require('./routes/categories');
const authRouter = require('./routes/auth');
const contactRouter = require('./routes/contact');
const metaRouter = require('./routes/meta');
const uploadRouter = require('./routes/upload');
const adminRouter = require('./routes/admin');
const analyticsRouter = require('./routes/analytics');

app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/meta', metaRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);

// Serve static frontend from backend/frontend
const staticDir = path.join(__dirname, 'frontend');

// Serve static files with explicit MIME type and caching headers
app.use(express.static(staticDir, {
  index: ['index.html'],
  setHeaders: (res, filePath) => {
    // Set proper MIME type for CSS files
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    
    // HTML files: no cache
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return;
    }
    
    // Versioned assets: long-term caching
    // Detect common versioned patterns (.min. or -<hash>.) in filenames to apply immutable caching
    const isAsset = /\.(js|css|png|jpg|jpeg|webp|svg|woff2|woff|ttf|eot)$/.test(filePath);
    const hasMin = filePath.includes('.min.');
    const hasHash = /-[a-f0-9]{6,}\./i.test(path.basename(filePath));
    if (isAsset && (hasMin || hasHash)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return;
    }
    
    // Default: moderate caching
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// Explicit routes for auth pages to ensure they're always served
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(staticDir, 'admin.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(staticDir, 'login.html'));
});

// SPA fallback for routes not starting with /api
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }

  // Don't serve index.html for static assets
  const staticExtensions = /\.(js|css|png|jpg|jpeg|webp|svg|gif|ico|woff2|woff|ttf|eot)$/i;
  if (staticExtensions.test(req.path)) {
    return res.status(404).send('Not found');
  }

  // Check if the requested file exists
  const requestedFile = path.join(staticDir, req.path);
  const fs = require('fs');

  if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
    return res.sendFile(requestedFile);
  }

  // Otherwise serve index.html for SPA routing
  const index = path.join(staticDir, 'index.html');
  res.sendFile(index, err => {
    if (err) res.status(500).send('Server error');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
