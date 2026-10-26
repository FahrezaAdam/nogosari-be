# 🌊 Nogosari Backend API

REST API untuk **Sistem Website Desa Nogosari** — mencakup monitoring ketinggian air sungai secara real-time melalui IoT (MQTT), data kelompok rentan banjir, posyandu, pengaduan warga, dan manajemen admin.

---

## 📋 Daftar Isi

- [Teknologi](#-teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Migrasi Database](#-migrasi-database)
- [Menjalankan Server](#-menjalankan-server)
- [Dokumentasi API](#-dokumentasi-api)
- [Daftar Endpoint](#-daftar-endpoint)
- [Deploy ke VPS (Rekomendasi Production)](#-deploy-ke-vps-rekomendasi-production)
- [Deploy ke Vercel](#-deploy-ke-vercel)
- [Arsitektur Sistem](#-arsitektur-sistem)

---

## 🛠 Teknologi

| Teknologi         | Keterangan                                |
| ----------------- | ----------------------------------------- |
| **Node.js**       | Runtime JavaScript                        |
| **Express.js v5** | Web framework                             |
| **PostgreSQL**    | Database relasional (via Neon / Supabase) |
| **MQTT (HiveMQ)** | Protokol IoT untuk data sensor            |
| **JWT**           | Autentikasi admin                         |
| **Bcrypt**        | Hash password                             |
| **Swagger UI**    | Dokumentasi API interaktif                |
| **Vercel**        | Platform deployment                       |

---

## 📁 Struktur Proyek

```
nogosari-be/
├── config/
│   ├── db.js              # Konfigurasi koneksi PostgreSQL (pg Pool)
│   └── mqtt.js            # Konfigurasi koneksi MQTT broker
├── controllers/
│   ├── authController.js
│   ├── dusunController.js
│   ├── pengaduanController.js
│   ├── posyanduController.js
│   ├── rentanBanjirController.js
│   └── sensorController.js
├── db/
│   ├── migrate.js         # Script migrasi database (programatik, tanpa .sql)
│   └── init.sql           # Referensi schema SQL (tidak dijalankan otomatis)
├── middlewares/
│   └── authMiddleware.js  # Verifikasi JWT token
├── routes/
│   ├── authRoutes.js
│   ├── dusunRoutes.js
│   ├── pengaduanRoutes.js
│   ├── posyanduRoutes.js
│   ├── rentanBanjirRoutes.js
│   └── sensorRoutes.js
├── services/
│   ├── cleanupService.js  # Auto-hapus data sensor lama (> 30 hari)
│   └── mqttService.js     # Subscriber MQTT & simpan ke database
├── .env                   # Environment variables (tidak di-commit)
├── .env.example           # Template environment variables
├── index.js               # Entry point aplikasi
├── package.json
├── swagger.json           # Spesifikasi OpenAPI
└── vercel.json            # Konfigurasi deploy Vercel
```

---

## ✅ Prasyarat

Pastikan sudah terinstal di komputer Anda:

- **Node.js** v18 atau lebih baru → [Download](https://nodejs.org)
- **npm** v9+ (sudah termasuk dalam Node.js)
- **Akses database PostgreSQL** (disarankan: [Neon](https://neon.tech) atau [Supabase](https://supabase.com))
- **MQTT Broker** (disarankan: [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/))

---

## 🚀 Instalasi & Setup

### 1. Clone repository

```bash
git clone <url-repository>
cd nogosari-be
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file `.env`

```bash
cp .env.example .env
```

Kemudian isi nilai-nilai yang diperlukan (lihat bagian [Konfigurasi Environment](#-konfigurasi-environment)).

---

## ⚙️ Konfigurasi Environment

Buka file `.env` dan sesuaikan nilainya:

```env
# ─── Database PostgreSQL (Format Lokal / VPS) ───────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password_postgres_anda
DB_NAME=nogosari_db

# Atau jika menggunakan Cloud DB (Neon / Supabase):
# DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# ─── Server ─────────────────────────────────────────────────────
PORT=3000

# ─── JWT ────────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here

# ─── MQTT Broker ────────────────────────────────────────────────
MQTT_BROKER=wss://your-cluster.s1.eu.hivemq.cloud:8884/mqtt
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
```

> **Tips Neon:**  
> Setelah membuat project di [neon.tech](https://neon.tech), klik **"Connection String"** dan salin URL-nya langsung ke `DATABASE_URL`.

---

## 🗄️ Migrasi Database

Migrasi akan **membuat semua tabel** dan **mengisi data awal** (seed) secara otomatis. Cukup jalankan satu kali:

```bash
npm run migrate
```

### Yang dilakukan oleh migrasi:

| Langkah                             | Deskripsi                                                    |
| ----------------------------------- | ------------------------------------------------------------ |
| Buat tabel `admins`                 | Tabel akun admin                                             |
| Buat tabel `sensor_devices`         | Daftar perangkat sensor IoT                                  |
| Buat tabel `sensor_readings`        | Data pembacaan ketinggian air                                |
| Buat tabel `layanan`                | Layanan desa                                                 |
| Buat tabel `posyandu`               | Master data posyandu                                         |
| Buat tabel `kategori_rentan`        | Kategori kelompok rentan banjir                              |
| Buat tabel `kelompok_rentan_banjir` | Data jumlah jiwa per kategori per posyandu                   |
| Buat tabel `pengaduan`              | Laporan pengaduan warga                                      |
| Seed `posyandu`                     | 5 posyandu awal (Bougenville 59–63)                          |
| Seed `kategori_rentan`              | 6 kategori (Bayi, Balita, Bumil, Busui, Lansia, Disabilitas) |
| Seed `kelompok_rentan_banjir`       | Data jumlah jiwa awal                                        |
| Seed `admins`                       | Akun admin default                                           |
| Seed `sensor_devices`               | Sensor `SN-001` di Sungai Nogosari Utama                     |

### Akun Admin Default

| Field    | Nilai                    |
| -------- | ------------------------ |
| Email    | `admin@nogosari.desa.id` |
| Password | `password123`            |
| Role     | `superadmin`             |

> ⚠️ **Segera ganti password** admin default setelah pertama kali login di production.

### Output sukses migrasi

```
🚀 Starting Database Migration...
  ✔ Table admins ready
  ✔ Table sensor_devices ready
  ✔ Table sensor_readings ready
  ✔ Table layanan ready
  ✔ Table posyandu ready
  ✔ Table kategori_rentan ready
  ✔ Table kelompok_rentan_banjir ready
  ✔ Table pengaduan ready
  ✔ Seed posyandu done
  ✔ Seed kategori_rentan done
  ✔ Seed kelompok_rentan_banjir done
  ✔ Seed admins done
  ✔ Seed sensor_devices done

✅ Database migration completed successfully!
```

---

## ▶️ Menjalankan Server

### Development (local)

```bash
npm run dev
```

### Production

```bash
npm start
```

Server berjalan di: **`http://localhost:3000`**

### Verifikasi server berjalan

```bash
curl http://localhost:3000/
```

Respons:

```json
{
  "message": "Nogosari Backend API is Running",
  "db_time": "2025-01-01T00:00:00.000Z"
}
```

---

## 📖 Dokumentasi API

Dokumentasi interaktif tersedia via **Swagger UI** setelah server berjalan:

```
http://localhost:3000/api-docs
```

---

## 🗺️ Daftar Endpoint

### 🔐 Auth

| Method | Endpoint          | Akses  | Deskripsi                          |
| ------ | ----------------- | ------ | ---------------------------------- |
| `POST` | `/api/auth/login` | Publik | Login admin, mendapatkan JWT token |

### 📡 Sensor

| Method | Endpoint                                   | Akses    | Deskripsi                   |
| ------ | ------------------------------------------ | -------- | --------------------------- |
| `GET`  | `/api/sensor/latest`                       | Publik   | Data ketinggian air terbaru |
| `GET`  | `/api/sensor/history`                      | Publik   | Riwayat pembacaan sensor    |
| `GET`  | `/api/sensor/devices`                      | Publik   | Daftar perangkat sensor     |
| `PUT`  | `/api/sensor/devices/:id_sensor/threshold` | 🔒 Admin | Update ambang batas sensor  |

### 🏘️ Rentan Banjir

| Method   | Endpoint                      | Akses    | Deskripsi                    |
| -------- | ----------------------------- | -------- | ---------------------------- |
| `GET`    | `/api/rentan-banjir`          | Publik   | Semua data kelompok rentan   |
| `GET`    | `/api/rentan-banjir/posyandu` | Publik   | Daftar posyandu              |
| `GET`    | `/api/rentan-banjir/kategori` | Publik   | Daftar kategori rentan       |
| `GET`    | `/api/rentan-banjir/summary`  | Publik   | Rekap total per kategori     |
| `POST`   | `/api/rentan-banjir`          | 🔒 Admin | Tambah data rentan banjir    |
| `POST`   | `/api/rentan-banjir/batch`    | 🔒 Admin | Simpan banyak data sekaligus |
| `POST`   | `/api/rentan-banjir/posyandu` | 🔒 Admin | Tambah posyandu baru         |
| `PUT`    | `/api/rentan-banjir/:id`      | 🔒 Admin | Update data rentan banjir    |
| `DELETE` | `/api/rentan-banjir/:id`      | 🔒 Admin | Hapus data rentan banjir     |

### 🏥 Posyandu

| Method   | Endpoint            | Akses    | Deskripsi       |
| -------- | ------------------- | -------- | --------------- |
| `GET`    | `/api/posyandu`     | Publik   | Semua posyandu  |
| `GET`    | `/api/posyandu/:id` | Publik   | Detail posyandu |
| `POST`   | `/api/posyandu`     | 🔒 Admin | Tambah posyandu |
| `PUT`    | `/api/posyandu/:id` | 🔒 Admin | Update posyandu |
| `DELETE` | `/api/posyandu/:id` | 🔒 Admin | Hapus posyandu  |

### 🏡 Dusun

| Method   | Endpoint         | Akses    | Deskripsi    |
| -------- | ---------------- | -------- | ------------ |
| `GET`    | `/api/dusun`     | Publik   | Semua dusun  |
| `GET`    | `/api/dusun/:id` | Publik   | Detail dusun |
| `POST`   | `/api/dusun`     | 🔒 Admin | Tambah dusun |
| `PUT`    | `/api/dusun/:id` | 🔒 Admin | Update dusun |
| `DELETE` | `/api/dusun/:id` | 🔒 Admin | Hapus dusun  |

### 📝 Pengaduan

| Method   | Endpoint             | Akses    | Deskripsi             |
| -------- | -------------------- | -------- | --------------------- |
| `POST`   | `/api/pengaduan`     | Publik   | Kirim pengaduan baru  |
| `GET`    | `/api/pengaduan`     | 🔒 Admin | Lihat semua pengaduan |
| `DELETE` | `/api/pengaduan/:id` | 🔒 Admin | Hapus pengaduan       |

### Contoh: Login Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@nogosari.desa.id", "password": "password123"}'
```

Respons:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Contoh: Menggunakan JWT Token

```bash
curl http://localhost:3000/api/pengaduan \
  -H "Authorization: Bearer <token_anda>"
```

---

## 🖥️ Deploy ke VPS (Rekomendasi Production)

VPS adalah platform yang paling direkomendasikan karena **MQTT Service (IoT)** dan **Auto-Cleanup Cron** membutuhkan proses Node.js yang berjalan 24/7 di latar belakang.

### 1. Install Kebutuhan di VPS (Ubuntu 22.04 / 24.04)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx postgresql postgresql-contrib

# Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### 2. Setup PostgreSQL Lokal di VPS

```bash
# Masuk ke PostgreSQL
sudo -u postgres psql

# Buat database & user baru
CREATE DATABASE nogosari_db;
CREATE USER nogosari_user WITH ENCRYPTED PASSWORD 'password_rahasia_anda';
GRANT ALL PRIVILEGES ON DATABASE nogosari_db TO nogosari_user;
\c nogosari_db
GRANT ALL ON SCHEMA public TO nogosari_user;
\q
```

### 3. Clone Proyek & Konfigurasi .env

```bash
cd /var/www
sudo git clone <URL_REPO_ANDA> nogosari-be
sudo chown -R $USER:$USER /var/www/nogosari-be
cd /var/www/nogosari-be

npm install --omit=dev
cp .env.example .env
nano .env
```

Isi konfigurasi database di `.env` VPS:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=nogosari_user
DB_PASSWORD=password_rahasia_anda
DB_NAME=nogosari_db
PORT=3000
JWT_SECRET=rahasia_jwt_anda_yang_sangat_panjang_dan_aman

MQTT_BROKER=wss://your-cluster.s1.eu.hivemq.cloud:8884/mqtt
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
```

### 4. Jalankan Migrasi Database

```bash
npm run migrate
```

### 5. Jalankan Aplikasi dengan PM2

```bash
pm2 start index.js --name "nogosari-be"
pm2 startup
pm2 save
```

### 6. Setup Reverse Proxy Nginx & SSL

Buat file konfigurasi `/etc/nginx/sites-available/nogosari-be`:
```nginx
server {
    listen 80;
    server_name api.domainanda.com; # atau IP VPS jika belum ada domain

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/nogosari-be /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Pasang SSL gratis (Let's Encrypt / Certbot jika sudah memiliki domain):
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.domainanda.com
```

---

## ☁️ Deploy ke Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login ke Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

### 4. Set environment variables di Vercel

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add MQTT_BROKER
vercel env add MQTT_USERNAME
vercel env add MQTT_PASSWORD
```

Atau atur melalui **Vercel Dashboard → Project → Settings → Environment Variables**.

### 5. Jalankan migrasi ke database production

Pastikan `DATABASE_URL` sudah mengarah ke database production, lalu:

```bash
npm run migrate
```

> **Catatan:** MQTT service dan cleanup cron **tidak berjalan di Vercel** (serverless). Keduanya hanya aktif saat server dijalankan secara non-Vercel (mis. VPS). Ini sudah ditangani otomatis di kode via `process.env.VERCEL`.

---

## 🏗️ Arsitektur Sistem

```
ESP32 (Sensor DYPA16)
    │
    │ MQTT Publish
    ▼
HiveMQ Cloud Broker
    │
    │ MQTT Subscribe
    ▼
nogosari-be (Node.js)
    ├── mqttService.js  ──→  PostgreSQL (Neon)
    ├── REST API        ──→  Frontend / Mobile App
    └── cleanupService  ──→  Auto-hapus data > 30 hari
```

### MQTT Topics yang Disubscribe

| Topic                               | Format Payload                                    | Keterangan                        |
| ----------------------------------- | ------------------------------------------------- | --------------------------------- |
| `water_level/jarak`                 | `1.25` (float, satuan meter)                      | Format langsung dari ESP32 DYPA16 |
| `desa/nogosari/sungai/+/ketinggian` | `{"id_sensor":"SN-001","nilai_ketinggian":125.0}` | Format JSON standar               |

### Status Siaga Sensor

| Status      | Kondisi                      |
| ----------- | ---------------------------- |
| **Aman**    | Di bawah ambang waspada      |
| **Waspada** | Mencapai `threshold_waspada` |
| **Siaga**   | Mencapai `threshold_siaga`   |
| **Bahaya**  | Mencapai `threshold_bahaya`  |

### Integrasi Monitoring Frontend

Endpoint `GET /api/sensor/latest` dan `GET /api/sensor/history` mengirimkan `nilai_ketinggian` dalam sentimeter (`cm`). Frontend SI-Tanggap menampilkan bacaan tersebut dalam meter dan memakai ambang tampilan berikut:

| Status tampilan | Ketinggian |
| --- | --- |
| Aman | 0 sampai 4 m |
| Siaga | lebih dari 4 sampai 6 m |
| Bahaya | lebih dari 6 m |

Pada batas tepat 4 m, frontend menampilkan status Aman. Status Siaga berlaku untuk bacaan di atas 4 m hingga 6 m. Status backend tetap ditentukan oleh konfigurasi `threshold_waspada`, `threshold_siaga`, dan `threshold_bahaya` pada perangkat sensor.

**Catatan satuan:** payload MQTT `water_level/jarak` berisi jarak sensor ke permukaan air dan dikonversi ke sentimeter. Nilai jarak ini belum otomatis menjadi ketinggian air absolut. Untuk memakai ambang frontend di atas pada data jarak, tinggi/posisi acuan pemasangan sensor harus diketahui dan konversi perlu dilakukan sebelum nilai dikirim ke tampilan.

---

## 📜 Scripts

| Command           | Deskripsi                        |
| ----------------- | -------------------------------- |
| `npm start`       | Jalankan server production       |
| `npm run dev`     | Jalankan server development      |
| `npm run migrate` | Jalankan migrasi & seed database |
