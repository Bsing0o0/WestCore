const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function initDB() {
  try {
    const sql = fs.readFileSync('database/schema.sql', 'utf8');
    const parts = sql.split('USE westcore_links;');
    const createDBSQL = parts[0];
    const restSQL = parts[1];

    // First, create database
    const connection1 = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });
    await connection1.execute(createDBSQL);
    await connection1.end();

    // Then, connect to the database and run the rest
    const connection2 = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: 'westcore_links',
      multipleStatements: true
    });
    await connection2.execute(restSQL);
    await connection2.end();

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  }
}

initDB();