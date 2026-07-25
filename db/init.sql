-- db/init.sql
-- Script untuk membuat tabel-tabel sesuai PRD (Aman dijalankan berulang kali)

-- 1. Table Admin
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    last_login TIMESTAMP
);

-- 2. Table Sensor Device
CREATE TABLE IF NOT EXISTS sensor_devices (
    id_sensor VARCHAR(50) PRIMARY KEY,
    nama_lokasi VARCHAR(255) NOT NULL,
    koordinat_lat DECIMAL(10, 8),
    koordinat_long DECIMAL(11, 8),
    threshold_waspada DECIMAL(5, 2) NOT NULL,
    threshold_siaga DECIMAL(5, 2) NOT NULL,
    threshold_bahaya DECIMAL(5, 2) NOT NULL,
    status_aktif BOOLEAN DEFAULT true
);

-- 3. Table Sensor Reading
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    id_sensor VARCHAR(50) REFERENCES sensor_devices(id_sensor) ON DELETE CASCADE,
    nilai_ketinggian DECIMAL(5, 2) NOT NULL,
    satuan VARCHAR(10) DEFAULT 'cm',
    status_siaga VARCHAR(20) NOT NULL, 
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table Layanan
CREATE TABLE IF NOT EXISTS layanan (
    id SERIAL PRIMARY KEY,
    nama_layanan VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    persyaratan TEXT
);

-- 6. Table Data Statistik
CREATE TABLE IF NOT EXISTS data_statistik (
    id SERIAL PRIMARY KEY,
    kategori VARCHAR(100) NOT NULL,
    nilai INT NOT NULL,
    periode VARCHAR(50)
);

-- 7. Table APBDes
CREATE TABLE IF NOT EXISTS apbdes (
    id SERIAL PRIMARY KEY,
    pos_anggaran VARCHAR(255) NOT NULL,
    nilai DECIMAL(15, 2) NOT NULL,
    tahun_anggaran INT NOT NULL
);

-- 8. Table Kelompok Rentan Banjir (Data Penduduk per Usia)
CREATE TABLE IF NOT EXISTS kelompok_rentan_banjir (
    id SERIAL PRIMARY KEY,
    kategori_usia VARCHAR(100) UNIQUE NOT NULL,
    jumlah_jiwa INT NOT NULL DEFAULT 0,
    keterangan TEXT
);

-- 9. Table Pengaduan Warga
CREATE TABLE IF NOT EXISTS pengaduan (
    id SERIAL PRIMARY KEY,
    nama_pengirim VARCHAR(100) NOT NULL,
    kontak VARCHAR(50),
    isi_pengaduan TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    tanggal_kirim TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data dummy kelompok rentan banjir
INSERT INTO kelompok_rentan_banjir (kategori_usia, jumlah_jiwa, keterangan) VALUES 
('Balita (0-5 tahun)', 120, 'Membutuhkan evakuasi khusus'),
('Anak-anak (6-12 tahun)', 250, ''),
('Dewasa (13-59 tahun)', 800, ''),
('Lansia (>60 tahun)', 85, 'Membutuhkan bantuan mobilitas')
ON CONFLICT (kategori_usia) DO NOTHING;

-- Insert data dummy admin awal (Password default: 'password123' di hash dengan bcrypt)
INSERT INTO admins (nama, email, password, role) 
VALUES ('Admin Desa', 'admin@nogosari.desa.id', '$2b$10$tZ20k9/UeK3HlE6V6a8KNuGInOqQ0O/LzQh/Q2Tq.fE23k51F9F8O', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Insert data dummy sensor device
INSERT INTO sensor_devices (id_sensor, nama_lokasi, koordinat_lat, koordinat_long, threshold_waspada, threshold_siaga, threshold_bahaya)
VALUES ('SN-001', 'Sungai Nogosari Utama', -8.123456, 113.123456, 100.00, 150.00, 200.00)
ON CONFLICT (id_sensor) DO NOTHING;