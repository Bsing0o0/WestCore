/**
 * Database Configuration and Connection Pool
 * Uses mysql2 with promise wrapper for async/await support
 */

const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool for better performance and connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'westcore_links',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Get promise-based pool for async/await
const promisePool = pool.promise();

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Execute a query with error handling
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query results
 */
async function query(sql, params = []) {
  try {
    const [results] = await promisePool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Async function that receives connection
 * @returns {Promise} Transaction results
 */
async function transaction(callback) {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Close all database connections (for graceful shutdown)
 */
async function closePool() {
  try {
    await pool.end();
    console.log('✓ Database connections closed');
  } catch (error) {
    console.error('✗ Error closing database connections:', error.message);
  }
}

module.exports = {
  pool,
  promisePool,
  query,
  transaction,
  testConnection,
  closePool
};