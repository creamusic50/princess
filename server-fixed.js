require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Enhanced Security Headers for AdSense + Admin Dashboard - COMPLETE CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://pagead2.googlesyndication.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://googleads.g.doubleclick.net",
        "https://adservice.google.com",
        "https://*.adtrafficquality.google",
        "https://www.google.com",
        "https://securepubads.g.doubleclick.net",
        "https://partner.googleadservices.com",
        "https://tpc.googlesyndication.com",
        "https://www.gstatic.com",
        "https://cdn.tiny.cloud",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://pagead2.googlesyndication.com",
        "https://www.gstatic.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "http:",
        "https://pagead2.googlesyndication.com",
        "https://www.google.com",
        "https://googleads.g.doubleclick.net",
        "https://tpc.googlesyndication.com",
        "https://*.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        "https://pagead2.googlesyndication.com",
        "https://www.youtube.com",
        "https://s.ytimg.com",
        "https://www.google.com",
        "https://*.adtrafficquality.google",
        "https://googleads.g.doubleclick.net",
        "https://tpc.googlesyndication.com",
        "https://csi.gstatic.com",
        "https://*.gstatic.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://adservice.google.com",
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
      childSrc: ["'self'", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Performance Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Service Worker with correct MIME type
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'frontend', 'sw.js'));
});

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/meta', require('./routes/meta'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString()
  });
});

// Static files with proper MIME types
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath, {
  setHeaders: (res, filePath) => {
    // Set correct MIME types
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    
    // Cache control
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filePath.match(/\.(css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

// Robots, Sitemap, Ads.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(frontendPath, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(frontendPath, 'sitemap.xml'));
});

app.get('/ads.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(frontendPath, 'ads.txt'));
});

// Catch-all
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🎯 CSP Fixed: No inline event handlers`);
  console.log(`📝 Service Worker: Correct MIME type`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin-new.html`);
  console.log(`⚙️  Settings: http://localhost:${PORT}/admin-settings.html`);
});

module.exports = app;
