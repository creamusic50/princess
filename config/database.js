const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
// Strip SSL parameters from connection string and disable SSL locally
let connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  // Fallback for local testing (won't actually connect)
  connectionString = 'postgresql://user:password@localhost/finance_blog';
}

// Remove SSL mode parameter if present (some URLs have ?sslmode=require)
connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
connectionString = connectionString.replace(/\?$/, '');

const pool = new Pool({
  connectionString: connectionString,
  ssl: false  // Disable SSL completely
});

// Don't test connection on startup - it will fail in local dev
// Instead, test lazily when first query is made
let connected = false;
let connectionError = null;

// Query helper function
const query = (text, params) => {
  return pool.query(text, params);
};

// Transaction helper
const transaction = async (operations) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const operation of operations) {
      const result = await client.query(operation.text, operation.params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  transaction,
  pool
};
