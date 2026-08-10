require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                  // Maksimal 20 koneksi bersamaan agar handle trafik IoT cepat
  idleTimeoutMillis: 30000,// Tutup koneksi menganggur setelah 30 detik
  connectionTimeoutMillis: 5000, // Timeout cepat (5 detik) jika database sibuk
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err); 
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
