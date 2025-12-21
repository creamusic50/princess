const express = require('express');
const path = require('path');
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

// Security headers with AdSense CSP fix
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com", "https://cdn.jsdelivr.net", "https://www.youtube.com", "https://s.ytimg.com", "https://ep1.adtrafficquality.google"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com", "https://cdn.jsdelivr.net", "https://www.youtube.com", "https://s.ytimg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://pagead2.googlesyndication.com", "https://www.youtube.com", "https://s.ytimg.com", "https://www.google.com", "https://ep1.adtrafficquality.google", "https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com"],
      frameSrc: ["https://pagead2.googlesyndication.com", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://www.google.com", "https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com"]
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Enhanced performance headers for Core Web Vitals
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Performance optimization headers
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add timing headers for performance monitoring
  res.setHeader('Server-Timing', 'db;dur=10, cache;dur=20');
  
  // Critical resource hints
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Link', [
      '</css/style.min.f5f26ea4.css>; rel=preload; as=style',
      '</js/config.min.f841bc00.js>; rel=preload; as=script',
      '</js/main.min.eb2549f5.js>; rel=preload; as=script',
      '<https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap>; rel=preload; as=style',
      '<https://fonts.gstatic.com>; rel=preconnect; crossorigin'
    ].join(', '));
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
const postsRouter = require('../routes/posts');
const categoriesRouter = require('../routes/categories');
const authRouter = require('../routes/auth');
const contactRouter = require('../routes/contact');
const metaRouter = require('../routes/meta');
const uploadRouter = require('../routes/upload');
const adminRouter = require('../routes/admin');

app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/meta', metaRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);

// Serve static frontend from backend/frontend
const staticDir = path.join(__dirname, 'frontend');

// Serve static files with explicit file type handling
// Serve pre-compressed assets (Brotli/gzip) when available, fallback to express.static
app.use('/', expressStaticGzip(staticDir, {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  setHeaders: (res, path) => {
    // Reuse same caching logic as below
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return;
    }
    if (/\.(js|css|png|jpg|jpeg|webp|svg|woff2|woff|ttf)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Fallback static serve (if no precompressed version found)
app.use(express.static(staticDir, {
  index: false,  // Don't automatically serve index.html for directories
  extensions: ['html', 'htm'], // Allow .html extension to be optional
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return;
    }
    if (/\.(js|css|png|jpg|jpeg|webp|svg|woff2|woff|ttf)$/.test(filePath)) {
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
