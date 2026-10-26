// db/migrate.js
// Menjalankan migrasi database secara programatik (tanpa init.sql)

const { pool } = require('../config/db');

async function migrate() {
  console.log('🚀 Starting Database Migration...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ─── 1. Buat tabel admins ───────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id          SERIAL PRIMARY KEY,
        nama        VARCHAR(100) NOT NULL,
        email       VARCHAR(100) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(50)  DEFAULT 'admin',
        last_login  TIMESTAMP
      )
    `);
    console.log('  ✔ Table admins ready');

    // ─── 2. Buat tabel sensor_devices ──────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_devices (
        id_sensor          VARCHAR(50)  PRIMARY KEY,
        nama_lokasi        VARCHAR(255) NOT NULL,
        koordinat_lat      DECIMAL(10, 8),
        koordinat_long     DECIMAL(11, 8),
        threshold_waspada  DECIMAL(5, 2) NOT NULL,
        threshold_siaga    DECIMAL(5, 2) NOT NULL,
        threshold_bahaya   DECIMAL(5, 2) NOT NULL,
        status_aktif       BOOLEAN DEFAULT true
      )
    `);
    console.log('  ✔ Table sensor_devices ready');

    // ─── 3. Buat tabel sensor_readings ────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        id               SERIAL PRIMARY KEY,
        id_sensor        VARCHAR(50) REFERENCES sensor_devices(id_sensor) ON DELETE CASCADE,
        nilai_ketinggian DECIMAL(5, 2) NOT NULL,
        satuan           VARCHAR(10)  DEFAULT 'cm',
        status_siaga     VARCHAR(20)  NOT NULL,
        timestamp        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✔ Table sensor_readings ready');

    // ─── 4. Buat tabel layanan ────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS layanan (
        id           SERIAL PRIMARY KEY,
        nama_layanan VARCHAR(255) NOT NULL,
        deskripsi    TEXT,
        persyaratan  TEXT
      )
    `);
    console.log('  ✔ Table layanan ready');

    // ─── 5. Buat tabel dusun ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS dusun (
        id         SERIAL PRIMARY KEY,
        nama_dusun VARCHAR(100) NOT NULL UNIQUE
      )
    `);
    console.log('  ✔ Table dusun ready');

    // ─── 6. Buat tabel posyandu ───────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS posyandu (
        id            SERIAL PRIMARY KEY,
        nama_posyandu VARCHAR(150) NOT NULL UNIQUE,
        id_dusun      INT REFERENCES dusun(id) ON DELETE SET NULL,
        dusun         VARCHAR(100)
      )
    `);
    // Pastikan kolom id_dusun & dusun ada jika tabel sudah pernah dibuat sebelumnya
    await client.query(`
      ALTER TABLE posyandu 
      ADD COLUMN IF NOT EXISTS id_dusun INT REFERENCES dusun(id) ON DELETE SET NULL;
      ALTER TABLE posyandu 
      ADD COLUMN IF NOT EXISTS dusun VARCHAR(100);
    `);
    console.log('  ✔ Table posyandu ready');

    // ─── 7. Buat tabel kategori_rentan ────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS kategori_rentan (
        id             SERIAL PRIMARY KEY,
        nama_kategori  VARCHAR(100) NOT NULL UNIQUE
      )
    `);
    console.log('  ✔ Table kategori_rentan ready');

    // ─── 8. Buat tabel kelompok_rentan_banjir ────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS kelompok_rentan_banjir (
        id           SERIAL PRIMARY KEY,
        id_posyandu  INT REFERENCES posyandu(id)         ON DELETE CASCADE,
        id_kategori  INT REFERENCES kategori_rentan(id)  ON DELETE CASCADE,
        jumlah_jiwa  INT NOT NULL DEFAULT 0,
        CONSTRAINT unique_posyandu_kategori_id UNIQUE (id_posyandu, id_kategori)
      )
    `);
    console.log('  ✔ Table kelompok_rentan_banjir ready');

    // ─── 9. Buat tabel pengaduan ─────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS pengaduan (
        id            SERIAL PRIMARY KEY,
        nama_pengirim VARCHAR(100) NOT NULL,
        kontak        VARCHAR(50),
        isi_pengaduan TEXT NOT NULL,
        tanggal_kirim TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✔ Table pengaduan ready');

    // ─── Seed: Data master dusun ──────────────────────────────────────────
    await client.query(`
      INSERT INTO dusun (id, nama_dusun) VALUES
        (1, 'Dusun Gumukbagu'),
        (2, 'Dusun Gumukgebang'),
        (3, 'Dusun Gumuklimo'),
        (4, 'Dusun Gumuksari'),
        (5, 'Dusun Krajan')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('  ✔ Seed dusun done');

    // ─── Seed: Data master posyandu ───────────────────────────────────────
    await client.query(`
      INSERT INTO posyandu (id, nama_posyandu, id_dusun, dusun) VALUES
        (1, 'Posyandu Bougenville 59 - Krajan',    5, 'Krajan'),
        (2, 'Posyandu Bougenville 60 - Krajan',    5, 'Krajan'),
        (3, 'Posyandu Bougenville 61 - Krajan',    5, 'Krajan'),
        (4, 'Posyandu Bougenville 62 - Gumuk Bago', 1, 'Gumuk Bago'),
        (5, 'Posyandu Bougenville 63 - Gumuk Bago', 1, 'Gumuk Bago')
      ON CONFLICT (id) DO UPDATE SET
        id_dusun = EXCLUDED.id_dusun,
        dusun = EXCLUDED.dusun
    `);
    console.log('  ✔ Seed posyandu done');

    // ─── Seed: Data master kategori rentan ────────────────────────────────
    await client.query(`
      INSERT INTO kategori_rentan (id, nama_kategori) VALUES
        (1, 'Bayi (0-2 tahun)'),
        (2, 'Balita (2-5 tahun)'),
        (3, 'Ibu Hamil'),
        (4, 'Ibu Menyusui'),
        (5, 'Lansia (>60 tahun)'),
        (6, 'Disabilitas')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('  ✔ Seed kategori_rentan done');

    // ─── Seed: Data kelompok rentan banjir ────────────────────────────────
    await client.query(`
      INSERT INTO kelompok_rentan_banjir (id_posyandu, id_kategori, jumlah_jiwa) VALUES
        (1,1,25),(1,2,25),(1,3,50),(1,4,160),(1,5,20),(1,6,20),
        (2,1,25),(2,2,25),(2,3,50),(2,4,160),(2,5,20),(2,6,20),
        (3,1,25),(3,2,25),(3,3,50),(3,4,160),(3,5,20),(3,6,20),
        (4,1,25),(4,2,25),(4,3,50),(4,4,160),(4,5,20),(4,6,20),
        (5,1,25),(5,2,25),(5,3,50),(5,4,160),(5,5,20),(5,6,20)
      ON CONFLICT (id_posyandu, id_kategori) DO NOTHING
    `);
    console.log('  ✔ Seed kelompok_rentan_banjir done');

    // ─── Seed: Admin default ──────────────────────────────────────────────
    // Password default: 'password123' (bcrypt hash)
    await client.query(`
      INSERT INTO admins (nama, email, password, role)
      VALUES ('Admin Desa', 'admin@nogosari.desa.id',
              '$2b$10$eokJMbW9oGhhCMEQkyiQWOa1SvpR423KniS79DvMnzJuW8kEzwz8y',
              'superadmin')
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('  ✔ Seed admins done');

    // ─── Seed: Sensor device default ──────────────────────────────────────
    await client.query(`
      INSERT INTO sensor_devices
        (id_sensor, nama_lokasi, koordinat_lat, koordinat_long,
         threshold_waspada, threshold_siaga, threshold_bahaya)
      VALUES
        ('SN-001', 'Sungai Nogosari Utama', -8.123456, 113.123456,
         100.00, 150.00, 200.00)
      ON CONFLICT (id_sensor) DO NOTHING
    `);
    console.log('  ✔ Seed sensor_devices done');

    await client.query('COMMIT');
    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
