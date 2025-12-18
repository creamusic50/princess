const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
// Determine SSL setting: allow disabling for local development (localhost)
let sslOption = { rejectUnauthorized: false };
if (process.env.DATABASE_SSL === 'false') {
  sslOption = false;
} else if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'))) {
  // Local Postgres often does not support SSL
  sslOption = false;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslOption
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL (Neon)');
    release();
  }
});

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
