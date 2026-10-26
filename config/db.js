require('dotenv').config();
const { Pool } = require('pg');

let poolConfig = {};

// Jika menggunakan parameter database terpisah (standar DB lokal & VPS)
if (process.env.DB_HOST || process.env.DB_NAME) {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nogosari_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
} else if (process.env.DATABASE_URL) {
  // Fallback jika menggunakan satu baris DATABASE_URL (Cloud seperti Neon/Supabase)
  const isLocalUrl =
    process.env.DATABASE_URL.includes('localhost') ||
    process.env.DATABASE_URL.includes('127.0.0.1') ||
    process.env.DB_SSL === 'false';

  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalUrl ? false : { rejectUnauthorized: false }
  };
}

const pool = new Pool({
  ...poolConfig,
  max: 20,                        // Maksimal 20 koneksi bersamaan agar handle trafik IoT cepat
  idleTimeoutMillis: 30000,      // Tutup koneksi menganggur setelah 30 detik
  connectionTimeoutMillis: 5000  // Timeout 5 detik jika database sibuk
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err); 
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  pool,
};
