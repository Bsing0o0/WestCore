const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: 'westcore_links'
    });

    const hash = '$2b$10$AAyf2svKRiJUvZKQSoiLGudrMNXboxlozESkW3Q/mccjB3Ca3LB0W';
    await connection.execute('UPDATE users SET password_hash = ? WHERE username = ?', [hash, 'admin']);

    console.log('Password updated successfully');
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updatePassword();