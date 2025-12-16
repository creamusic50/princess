const express = require('express');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Simple health check
app.get('/_health', (req, res) => res.json({ ok: true }));

// Serve static frontend from backend/frontend
const staticDir = path.join(__dirname, 'frontend');

// Serve static files with explicit file type handling
app.use(express.static(staticDir, {
  index: false,  // Don't automatically serve index.html for directories
  extensions: ['html', 'htm']  // Allow .html extension to be optional
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
