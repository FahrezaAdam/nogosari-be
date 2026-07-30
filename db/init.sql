-- db/init.sql
-- Script untuk membuat tabel-tabel sesuai PRD (Menghapus tabel lama & membuat ulang)

-- Drop tabel lama jika sudah ada (Reset Database)
DROP TABLE IF EXISTS kelompok_rentan_banjir CASCADE;
DROP TABLE IF EXISTS kategori_rentan CASCADE;
DROP TABLE IF EXISTS posyandu CASCADE;
DROP TABLE IF EXISTS sensor_readings CASCADE;
DROP TABLE IF EXISTS sensor_devices CASCADE;
DROP TABLE IF EXISTS pengaduan CASCADE;
DROP TABLE IF EXISTS layanan CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

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

-- 5. Table Master Posyandu
CREATE TABLE IF NOT EXISTS posyandu (
    id SERIAL PRIMARY KEY,
    nama_posyandu VARCHAR(150) NOT NULL UNIQUE,
    dusun VARCHAR(100)
);

-- 6. Table Master Kategori Rentan
CREATE TABLE IF NOT EXISTS kategori_rentan (
    id SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL UNIQUE
);

-- 7. Table Data Kelompok Rentan Banjir (Relasi Posyandu & Kategori Rentan)
CREATE TABLE IF NOT EXISTS kelompok_rentan_banjir (
    id SERIAL PRIMARY KEY,
    id_posyandu INT REFERENCES posyandu(id) ON DELETE CASCADE,
    id_kategori INT REFERENCES kategori_rentan(id) ON DELETE CASCADE,
    jumlah_jiwa INT NOT NULL DEFAULT 0,
    CONSTRAINT unique_posyandu_kategori_id UNIQUE (id_posyandu, id_kategori)
);

-- 8. Table Pengaduan Warga
CREATE TABLE IF NOT EXISTS pengaduan (
    id SERIAL PRIMARY KEY,
    nama_pengirim VARCHAR(100) NOT NULL,
    kontak VARCHAR(50),
    isi_pengaduan TEXT NOT NULL,
    tanggal_kirim TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Data Master Posyandu
INSERT INTO posyandu (id, nama_posyandu, dusun) VALUES
(1, 'Posyandu Bougenville 59 - Krajan', 'Krajan'),
(2, 'Posyandu Bougenville 60 - Krajan', 'Krajan'),
(3, 'Posyandu Bougenville 61 - Krajan', 'Krajan'),
(4, 'Posyandu Bougenville 62 - Gumuk Bago', 'Gumuk Bago'),
(5, 'Posyandu Bougenville 63 - Gumuk Bago', 'Gumuk Bago')
ON CONFLICT (id) DO NOTHING;

-- Insert Data Master Kategori Rentan
INSERT INTO kategori_rentan (id, nama_kategori) VALUES
(1, 'Bayi (0-2 tahun)'),
(2, 'Balita (2-5 tahun)'),
(3, 'Ibu Hamil'),
(4, 'Ibu Menyusui'),
(5, 'Lansia (>60 tahun)'),
(6, 'Disabilitas')
ON CONFLICT (id) DO NOTHING;

-- Insert Data Kelompok Rentan Banjir (Relasi Posyandu & Kategori)
INSERT INTO kelompok_rentan_banjir (id_posyandu, id_kategori, jumlah_jiwa) VALUES 
-- Posyandu 59 (id: 1)
(1, 1, 25), (1, 2, 25), (1, 3, 50), (1, 4, 160), (1, 5, 20), (1, 6, 20),

-- Posyandu 60 (id: 2)
(2, 1, 25), (2, 2, 25), (2, 3, 50), (2, 4, 160), (2, 5, 20), (2, 6, 20),

-- Posyandu 61 (id: 3)
(3, 1, 25), (3, 2, 25), (3, 3, 50), (3, 4, 160), (3, 5, 20), (3, 6, 20),

-- Posyandu 62 (id: 4)
(4, 1, 25), (4, 2, 25), (4, 3, 50), (4, 4, 160), (4, 5, 20), (4, 6, 20),

-- Posyandu 63 (id: 5)
(5, 1, 25), (5, 2, 25), (5, 3, 50), (5, 4, 160), (5, 5, 20), (5, 6, 20)
ON CONFLICT (id_posyandu, id_kategori) DO NOTHING;

-- Insert data dummy admin awal (Password default: 'password123' di hash dengan bcrypt)
INSERT INTO admins (nama, email, password, role) 
VALUES ('Admin Desa', 'admin@nogosari.desa.id', '$2b$10$tZ20k9/UeK3HlE6V6a8KNuGInOqQ0O/LzQh/Q2Tq.fE23k51F9F8O', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Insert data dummy sensor device
INSERT INTO sensor_devices (id_sensor, nama_lokasi, koordinat_lat, koordinat_long, threshold_waspada, threshold_siaga, threshold_bahaya)
VALUES ('SN-001', 'Sungai Nogosari Utama', -8.123456, 113.123456, 100.00, 150.00, 200.00)
ON CONFLICT (id_sensor) DO NOTHING;