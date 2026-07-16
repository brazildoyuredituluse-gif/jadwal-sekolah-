// Koneksi database — memakai connection pool + prepared statements
// (mysql2 secara default menggunakan placeholder `?`, ini mencegah SQL Injection
// selama seluruh kode di /models memakai placeholder, bukan string concat).

const mysql = require('mysql2/promise');
require('dotenv').config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`[FATAL] Variabel .env "${key}" belum diisi. Salin .env.example ke .env lalu lengkapi.`);
    process.exit(1);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

module.exports = pool;
