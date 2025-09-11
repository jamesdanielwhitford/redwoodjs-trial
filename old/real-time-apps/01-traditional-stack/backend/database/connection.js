import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// Database connection configuration
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait when connecting a client
  acquireTimeoutMillis: 60000, // How long to wait to acquire a connection
};

// Create connection pool
const pool = new Pool(config);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

// Handle pool connection
pool.on('connect', (client) => {
  console.log('New database client connected');
});

// Handle pool removal
pool.on('remove', (client) => {
  console.log('Database client removed from pool');
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }
}

// Query wrapper with error handling
async function query(text, params = []) {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query:', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    console.error('Database query error:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      error: err.message,
      params: params
    });
    throw err;
  }
}

// Transaction wrapper
async function transaction(queries) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { text, params } of queries) {
      const result = await client.query(text, params || []);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Get database statistics
async function getStats() {
  try {
    const result = await query(`
      SELECT 
        pg_database.datname,
        pg_database_size(pg_database.datname) as size_bytes,
        pg_stat_database.numbackends as connections,
        pg_stat_database.xact_commit as commits,
        pg_stat_database.xact_rollback as rollbacks
      FROM pg_database 
      JOIN pg_stat_database ON pg_database.datname = pg_stat_database.datname
      WHERE pg_database.datname = current_database()
    `);
    
    return result.rows[0];
  } catch (err) {
    console.error('Failed to get database stats:', err.message);
    return null;
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down database connection pool...');
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (err) {
    console.error('Error closing database pool:', err.message);
  }
}

// Initialize connection on startup
testConnection().catch(err => {
  console.error('Failed to initialize database connection');
  process.exit(1);
});

export { 
  pool, 
  query, 
  transaction, 
  testConnection, 
  getStats, 
  shutdown 
};