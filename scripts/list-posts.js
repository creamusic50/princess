const db = require('../config/database');

(async () => {
  try {
    const res = await db.query(`SELECT id, title, slug, published, created_at FROM posts ORDER BY created_at DESC LIMIT 50`);
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error listing posts:', err.stack || err.message);
    process.exit(1);
  }
})();
