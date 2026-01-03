const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
let connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL not set - using fallback (connections will fail)');
  connectionString = 'postgresql://user:password@localhost/finance_blog';
}

// Determine if we need SSL based on the connection string
const isProduction = process.env.NODE_ENV === 'production';
const isNeon = connectionString.includes('neon.tech');
const isRemoteDB = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');

const sslConfig = (isNeon || isRemoteDB) ? {
  rejectUnauthorized: false // Required for Neon and most cloud PostgreSQL
} : false;

console.log('🔧 Database Configuration:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   SSL Enabled:', !!sslConfig);
console.log('   Is Neon:', isNeon);

const pool = new Pool({
  connectionString: connectionString,
  ssl: sslConfig,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 30000, // Increased to 30 seconds for Neon wake-up time
  query_timeout: 20000, // Query timeout (20 seconds)
  statement_timeout: 20000 // Statement timeout (20 seconds)
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Check your DATABASE_URL in .env file');
  } else {
    console.log('✅ Database connected successfully');
    console.log('   Timestamp:', res.rows[0].now);
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err);
});

// Query helper function with error handling
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
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
