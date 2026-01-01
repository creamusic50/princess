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
  level: 6,  // Balanced compression (9 = max CPU, 6 = good balance)
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

// Security headers - CSP REMOVED for full flexibility
app.use(helmet({
  contentSecurityPolicy: false,  // DISABLED - No more CSP restrictions!
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// Enhanced performance headers for Core Web Vitals (100/100 Desktop Optimized)
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Performance optimization headers
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add timing headers for performance monitoring
  res.setHeader('Server-Timing', 'db;dur=10, cache;dur=20');
  
  // Enable compression headers
  if (req.headers['accept-encoding']?.includes('gzip')) {
    res.setHeader('Vary', 'Accept-Encoding');
  }
  
  // Set cache control based on content type
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else if (/\.(js|css|woff2|woff|ttf|otf|eot)$/.test(req.path)) {
    // Immutable static assets - cache for 1 year
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (/\.(jpg|jpeg|png|gif|svg|webp|ico)$/.test(req.path)) {
    // Images - cache for 30 days
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  } else {
    // Default cache for 1 day
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
  
  // Critical resource hints for improved performance
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Link', [
      '</js/config.min.f841bc00.js>; rel=preload; as=script; nopush; fetchpriority=high',
      '</js/main.min.eb2549f5.js>; rel=preload; as=script; nopush; fetchpriority=high',
      '</css/responsive.min.c014bbda.css>; rel=preload; as=style; nopush; fetchpriority=high',
      '<https://fonts.googleapis.com>; rel=dns-prefetch',
      '<https://fonts.gstatic.com>; rel=dns-prefetch; crossorigin',
      '<https://pagead2.googlesyndication.com>; rel=dns-prefetch'
    ].join(', '));
  }
  
  // Enable CORS preflight caching for better performance
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400');
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

// Mount API routes from repository root
const postsRouter = require(path.join(__dirname, '..', 'routes', 'posts'));
const categoriesRouter = require(path.join(__dirname, '..', 'routes', 'categories'));
const authRouter = require(path.join(__dirname, '..', 'routes', 'auth'));
const contactRouter = require(path.join(__dirname, '..', 'routes', 'contact'));
const metaRouter = require(path.join(__dirname, '..', 'routes', 'meta'));
const uploadRouter = require(path.join(__dirname, '..', 'routes', 'upload'));
const adminRouter = require(path.join(__dirname, '..', 'routes', 'admin'));
const analyticsRouter = require(path.join(__dirname, '..', 'routes', 'analytics'));

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

// Serve pre-compressed assets (Brotli/gzip) when available
app.use('/', expressStaticGzip(staticDir, {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    // No-cache for HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return;
    }
    // Immutable cache for hashed assets
    if (/\.(js|css)$/.test(filePath) && /[a-f0-9]{8,}/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return;
    }
    // Images - 30 days
    if (/\.(png|jpg|jpeg|gif|webp|svg|ico)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      return;
    }
    // Fonts - 1 year
    if (/\.(woff2|woff|ttf|otf|eot)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Fallback static serve
app.use(express.static(staticDir, {
  index: false,
  extensions: ['html', 'htm'],
  maxAge: '1d',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      return;
    }
    if (/\.(js|css)$/.test(filePath) && /[a-f0-9]{8,}/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return;
    }
    if (/\.(png|jpg|jpeg|gif|webp|svg|ico)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      return;
    }
    if (/\.(woff2|woff|ttf|otf|eot)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Explicit route for admin.html to ensure it's always served
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(staticDir, 'admin.html'));
});

// SPA fallback for routes not starting with /api
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
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
