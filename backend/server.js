const express = require('express');
const path = require('path');

const app = express();

// Serve static frontend from backend/frontend
const staticDir = path.join(__dirname, 'frontend');
app.use(express.static(staticDir));

// Simple health check
app.get('/_health', (req, res) => res.json({ ok: true }));

// SPA fallback
app.get('*', (req, res) => {
  const index = path.join(staticDir, 'index.html');
  res.sendFile(index, err => {
    if (err) res.status(500).send('Server error');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
