const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com", "https://cdn.jsdelivr.net", "https://www.youtube.com", "https://s.ytimg.com"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com", "https://cdn.jsdelivr.net", "https://www.youtube.com", "https://s.ytimg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://pagead2.googlesyndication.com", "https://www.youtube.com", "https://s.ytimg.com", "https://www.google.com"],
      frameSrc: ["https://pagead2.googlesyndication.com", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://www.google.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());

// Body parsing middleware
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from frontend directory
const frontendPath = path.join(__dirname, 'frontend');
console.log('Serving frontend from:', frontendPath);

// Serve all static assets (CSS, JS, images, etc.)
app.use(express.static(frontendPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}));

// Explicit routes for specific HTML files
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

app.get('/post.html', (req, res) => {
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
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log('===========================================');
});

module.exports = app;
