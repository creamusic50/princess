require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const contactRoutes = require('./routes/contact');
const metaRoutes = require('./routes/meta');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

// Import middleware
const { protect, admin } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - UPDATED for serving static files
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.quilljs.com", "https://pagead2.googlesyndication.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://pagead2.googlesyndication.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://googleads.g.doubleclick.net"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:5000'];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==========================================
// SERVE STATIC FILES (FRONTEND)
// ==========================================
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', protect, admin, adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.1.0'
  });
});

// ==========================================
// FRONTEND ROUTING (SPA Support)
// ==========================================
// Serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // If it's an API route that doesn't exist, return 404 JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false, 
      message: 'API endpoint not found' 
    });
  }
  
  // For all other routes, serve the corresponding HTML file
  const requestedFile = req.path === '/' ? 'index.html' : req.path;
  const filePath = path.join(__dirname, '../frontend', requestedFile);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      // If file doesn't exist, serve index.html (for SPA routing)
      res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
    }
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use(errorHandler);

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.url}`
    });
  } else {
    next();
  }
});

// ==========================================
// START SERVER
// ==========================================
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀  SMART MONEY GUIDE - SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`📍  Port: ${PORT}`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗  Server: http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('📂  AVAILABLE PAGES:');
  console.log(`   🏠  Home:         http://localhost:${PORT}`);
  console.log(`   📝  Admin Panel:  http://localhost:${PORT}/admin.html`);
  console.log(`   📧  Contact:      http://localhost:${PORT}/contact.html`);
  console.log(`   👤  Login:        http://localhost:${PORT}/login.html`);
  console.log('='.repeat(60));
  console.log('🔌  API ENDPOINTS:');
  console.log(`   📊  Health:       http://localhost:${PORT}/api/health`);
  console.log(`   📝  Posts:        http://localhost:${PORT}/api/posts`);
  console.log(`   🏷️   Categories:   http://localhost:${PORT}/api/categories`);
  console.log(`   👤  Auth:         http://localhost:${PORT}/api/auth`);
  console.log('='.repeat(60));
  console.log('💡  TIP: Press Ctrl+C to stop the server');
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅  Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅  Server closed.');
    process.exit(0);
  });
});

module.exports = app;
