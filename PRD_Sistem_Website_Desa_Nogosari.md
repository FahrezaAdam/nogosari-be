# PRODUCT REQUIREMENTS DOCUMENT
## Sistem Website Desa dengan Monitoring Ketinggian Air Sungai Berbasis IoT
**Studi Kasus:** Desa Nogosari — Program PPK Ormawa BEM FKM
**Versi:** 1.0
**Tanggal:** 25 Juli 2026

---

## Daftar Isi
1. Latar Belakang
2. Tujuan Produk
3. Target Pengguna & Peran
4. Ruang Lingkup (Scope)
5. User Stories
6. Struktur Navigasi & Halaman
7. Functional Requirements
8. Arsitektur Sistem & Alur Data IoT
9. Non-Functional Requirements
10. Data & Skema Utama
11. Asumsi & Batasan
12. Metrik Keberhasilan
13. Roadmap Pengembangan

---

## 1. Latar Belakang

Desa Nogosari merupakan salah satu wilayah yang rawan bencana banjir akibat luapan air sungai, terutama pada musim hujan. Keterlambatan informasi mengenai kenaikan debit dan ketinggian air menjadi salah satu faktor yang memperbesar risiko kerugian material maupun korban jiwa bagi warga sekitar.

Melalui program Pengabdian kepada Masyarakat oleh Kelompok Mahasiswa (PPK Ormawa) BEM FKM Universitas Jember, dikembangkan sebuah sistem website desa yang terintegrasi dengan perangkat IoT (ESP32 dan sensor ketinggian air) untuk memberikan informasi dini secara real-time kepada perangkat desa, sehingga proses monitoring dan pengambilan keputusan mitigasi bencana dapat dilakukan lebih cepat dan tepat.

Selain fitur monitoring banjir, website ini juga berfungsi sebagai kanal informasi resmi desa (profil, berita, layanan administrasi, dan transparansi data/anggaran) yang dikelola oleh admin/perangkat desa.

## 2. Tujuan Produk

- Menyediakan sistem peringatan dini (early warning) ketinggian air sungai berbasis data sensor IoT secara real-time.
- Memberikan perangkat desa alat bantu visual (dashboard, grafik historis) untuk memantau tren ketinggian air dan mengambil keputusan mitigasi.
- Menyediakan kanal informasi resmi desa yang mencakup profil, berita/pengumuman, layanan administrasi, dan data transparansi (APBDes, statistik penduduk).
- Menyederhanakan pengelolaan konten desa melalui panel admin yang aman (autentikasi login & manajemen password).

## 3. Target Pengguna & Peran

Berdasarkan keputusan produk, sistem ini ditujukan khusus untuk penggunaan internal oleh Admin/Perangkat Desa. Warga umum tidak memiliki akun; warga hanya mengakses konten publik (Beranda, Profil Desa, Berita, Layanan & Kontak, Data & Statistik, dan Dashboard Monitoring IoT versi publik) tanpa perlu login.

| Peran | Deskripsi | Hak Akses |
|---|---|---|
| Admin/Perangkat Desa | Pengelola konten & sistem, login melalui halaman Login | Kelola berita, kelola data monitoring/threshold, kelola layanan, kelola data statistik/APBDes, reset password |
| Pengunjung (Warga/Publik) | Pengguna tanpa akun, mengakses situs secara publik | Lihat semua halaman publik & dashboard monitoring (read-only), tanpa akses ke fitur pengelolaan |

## 4. Ruang Lingkup (Scope)

### 4.1 Termasuk dalam Scope (In-Scope)
- Website publik desa (profil, berita, layanan, kontak, data statistik).
- Dashboard monitoring ketinggian air sungai real-time berbasis data sensor IoT (ESP32).
- Sistem autentikasi admin (login, lupa password, verifikasi/reset password).
- Panel pengelolaan konten untuk admin (CRUD berita, data layanan, data statistik).
- Integrasi perangkat IoT (ESP32 + sensor ketinggian air) ke backend melalui MQTT broker.

### 4.2 Di Luar Scope (Out of Scope) — versi 1.0
- Akun/login untuk warga umum.
- Layanan pengajuan surat online end-to-end dengan approval workflow (hanya ditampilkan sebagai informasi layanan pada versi awal, kecuali ditentukan lain).
- Notifikasi otomatis via WhatsApp/Telegram (dicatat sebagai kandidat pengembangan lanjutan, lihat bagian Roadmap).
- Aplikasi mobile native.

## 5. User Stories

### 5.1 Admin/Perangkat Desa
- Sebagai admin, saya ingin login ke sistem menggunakan akun resmi agar hanya perangkat desa yang berwenang yang dapat mengelola konten.
- Sebagai admin, saya ingin mengajukan reset password melalui fitur "Lupa Password" apabila lupa kredensial akun.
- Sebagai admin, saya ingin melihat dashboard ketinggian air sungai secara real-time agar dapat memantau potensi banjir.
- Sebagai admin, saya ingin melihat grafik historis ketinggian air agar dapat menganalisis tren kenaikan/penurunan air dari waktu ke waktu.
- Sebagai admin, saya ingin sistem menampilkan status siaga (aman/waspada/siaga/bahaya) secara otomatis berdasarkan ambang batas (threshold) ketinggian air.
- Sebagai admin, saya ingin menambah, mengedit, dan menghapus berita/pengumuman agar informasi desa selalu terbaru.
- Sebagai admin, saya ingin mengelola data layanan administrasi dan kontak desa agar informasi yang ditampilkan ke publik akurat.
- Sebagai admin, saya ingin mengelola/memperbarui data statistik penduduk dan APBDes agar transparansi data desa terjaga.

### 5.2 Pengunjung (Warga/Publik)
- Sebagai warga, saya ingin melihat status ketinggian air sungai terkini agar dapat mengantisipasi risiko banjir.
- Sebagai warga, saya ingin membaca berita dan pengumuman desa agar mengetahui informasi/kegiatan terbaru.
- Sebagai warga, saya ingin melihat informasi layanan dan kontak desa agar dapat mengurus keperluan administrasi.
- Sebagai warga, saya ingin melihat data statistik dan APBDes desa sebagai bentuk transparansi anggaran.

## 6. Struktur Navigasi & Halaman

Struktur navigasi berikut disusun berdasarkan desain (Figma: PPK ORMAWA) yang terdiri dari 9 halaman.

| No | Halaman | Akses | Deskripsi Singkat |
|---|---|---|---|
| 1 | Beranda | Publik | Landing page: hero/sambutan desa, galeri foto kegiatan, ringkasan siklus monitoring. |
| 2 | Profil Desa | Publik | Sejarah, visi-misi, struktur organisasi, peta wilayah/batas desa, galeri wilayah. |
| 3 | Monitoring IoT (Banjir) | Publik (data), Admin (kelola threshold) | Dashboard ketinggian air real-time, grafik historis, status siaga, peta lokasi sensor. |
| 4 | Berita & Pengumuman | Publik (baca), Admin (kelola) | Daftar berita/artikel desa & pengumuman terkait kegiatan/kebencanaan. |
| 5 | Layanan & Kontak | Publik (lihat), Admin (kelola) | Informasi layanan administratif desa dan data kontak/lokasi. |
| 6 | Data & Statistik | Publik (lihat), Admin (kelola) | Data transparansi: statistik penduduk & APBDes/anggaran desa. |
| 7 | Login | Admin | Autentikasi masuk untuk admin/perangkat desa. |
| 8 | Lupa Password (Step 1) | Admin | Permintaan reset password melalui email/nomor terdaftar. |
| 9 | Lupa Password (Step 2 - Verifikasi) | Admin | Verifikasi kode OTP dan pembuatan password baru. |

## 7. Functional Requirements

### 7.1 Beranda
1. Sistem menampilkan hero section berisi gambar/banner dan sambutan resmi desa.
2. Sistem menampilkan ringkasan galeri kegiatan desa.
3. Sistem menampilkan ringkasan status monitoring banjir (widget singkat) yang mengarah ke halaman Monitoring IoT.

### 7.2 Profil Desa
1. Sistem menampilkan sejarah desa, visi & misi dalam bentuk teks terstruktur.
2. Sistem menampilkan struktur organisasi perangkat desa (nama, jabatan, foto opsional).
3. Sistem menampilkan peta wilayah/batas desa (embed map).
4. Sistem menampilkan galeri foto wilayah desa.

### 7.3 Monitoring IoT (Banjir) — Fitur Inti
1. Sistem menerima data ketinggian air dari sensor melalui perangkat ESP32 yang terhubung ke MQTT broker.
2. Sistem menampilkan nilai ketinggian air terkini beserta waktu pembacaan terakhir (timestamp).
3. Sistem menampilkan grafik historis ketinggian air (line chart) dengan opsi rentang waktu (per jam/hari).
4. Sistem menghitung dan menampilkan status siaga otomatis berdasarkan ambang batas (threshold) yang dikonfigurasi admin, dengan kategori minimal: Aman, Waspada, Siaga, Bahaya.
5. Sistem menampilkan indikator status siaga menggunakan kode warna (hijau/kuning/oranye/merah).
6. Sistem menampilkan lokasi pemasangan sensor pada peta.
7. Admin dapat mengatur/mengubah nilai ambang batas (threshold) status siaga.
8. Sistem mencatat log historis pembacaan sensor untuk keperluan analisis tren.
9. (Kandidat lanjutan, lihat Roadmap) Sistem dapat mengirim notifikasi otomatis saat status naik ke level Siaga/Bahaya.

### 7.4 Berita & Pengumuman
1. Admin dapat membuat, mengedit, menghapus, dan mempublikasikan berita/pengumuman (judul, isi, gambar, tanggal).
2. Publik dapat melihat daftar berita terbaru dan membuka detail berita.
3. Sistem mendukung kategori/label berita (misal: kegiatan, pengumuman darurat).

### 7.5 Layanan & Kontak
1. Sistem menampilkan daftar layanan administratif desa beserta deskripsi/persyaratan.
2. Sistem menampilkan informasi kontak resmi desa (alamat, telepon, email, lokasi peta).
3. Admin dapat memperbarui data layanan dan kontak melalui panel admin.

### 7.6 Data & Statistik
1. Sistem menampilkan data statistik penduduk (jumlah, kategori sesuai data yang tersedia) dalam bentuk ringkasan/grafik.
2. Sistem menampilkan data APBDes/anggaran desa sebagai bentuk transparansi.
3. Admin dapat memperbarui data statistik dan anggaran secara berkala.

### 7.7 Autentikasi (Login & Lupa Password)
1. Sistem menyediakan halaman Login dengan input username/email dan password.
2. Sistem memvalidasi kredensial dan membuat sesi (session/token) admin yang berhasil login.
3. Sistem menyediakan alur "Lupa Password" terdiri dari: (a) permintaan reset melalui email/nomor terdaftar, (b) verifikasi kode OTP, (c) pembuatan password baru.
4. Sistem membatasi jumlah percobaan login/OTP untuk mencegah penyalahgunaan (rate limiting).

## 8. Arsitektur Sistem & Alur Data IoT

Alur data monitoring ketinggian air mengikuti keputusan bahwa perangkat ESP32 mengirim data ke MQTT broker terlebih dahulu, kemudian diteruskan ke backend untuk diproses dan disimpan.

### 8.1 Alur Data (High-Level)
1. Sensor ketinggian air membaca data secara berkala dan mengirimkannya ke mikrokontroler ESP32.
2. ESP32 mem-publish data (payload berisi nilai ketinggian air, ID sensor, timestamp) ke topic tertentu pada MQTT broker.
3. Backend (subscriber) menerima data dari broker, melakukan validasi, dan menyimpannya ke database.
4. Backend menghitung status siaga berdasarkan nilai threshold yang tersimpan, lalu meng-update status terkini.
5. Frontend (dashboard web) mengambil data terkini dan historis dari backend melalui REST API (atau melalui WebSocket/polling untuk data real-time).
6. (Kandidat lanjutan) Backend memicu notifikasi ke kanal eksternal (WhatsApp/Telegram) apabila status naik ke level Siaga/Bahaya.

### 8.2 Komponen Utama

| Komponen | Fungsi |
|---|---|
| Sensor Ketinggian Air | Mengukur ketinggian permukaan air sungai secara berkala. |
| ESP32 | Mikrokontroler yang membaca data sensor dan mem-publish ke MQTT broker. |
| MQTT Broker | Perantara komunikasi pesan antara perangkat IoT dan backend (protokol publish-subscribe). |
| Backend/API | Menerima, memvalidasi, menyimpan data sensor; menyediakan REST API untuk frontend; mengelola autentikasi dan konten desa. |
| Database | Menyimpan data historis sensor, data konten desa, data pengguna admin. |
| Frontend Web | Menyajikan seluruh halaman publik dan panel admin sesuai desain Figma. |

### 8.3 Catatan Teknis
- Topic MQTT sebaiknya distandarkan per lokasi sensor, contoh: `desa/nogosari/sungai/{id_sensor}/ketinggian`.
- Payload disarankan berformat JSON, minimal berisi: `id_sensor`, `nilai_ketinggian`, `satuan`, `timestamp`.
- Perlu mekanisme deteksi sensor offline/tidak mengirim data dalam rentang waktu tertentu, untuk ditampilkan sebagai status "Data tidak tersedia".

## 9. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performa | Dashboard monitoring menampilkan data terkini dengan latensi maksimal beberapa detik hingga menit sejak data diterima broker (target disesuaikan kapasitas jaringan desa). |
| Ketersediaan | Sistem web dan penerimaan data IoT diharapkan tersedia 24/7, dengan penanganan reconnect otomatis apabila koneksi MQTT terputus. |
| Keamanan | Autentikasi admin wajib menggunakan password ter-hash; komunikasi menggunakan HTTPS; broker MQTT menggunakan autentikasi (username/password atau TLS). |
| Skalabilitas | Arsitektur mendukung penambahan titik sensor baru tanpa perubahan besar pada backend. |
| Usabilitas | Antarmuka mengikuti desain Figma yang sudah dibuat, responsif untuk perangkat desktop dan mobile. |
| Auditabilitas | Perubahan konten oleh admin (berita, threshold, data statistik) tercatat dengan informasi waktu dan pelaku perubahan. |

## 10. Data & Skema Utama (Ringkas)

- **Admin**: id, nama, email/username, password (hash), role, timestamp login terakhir.
- **SensorReading**: id, id_sensor, nilai_ketinggian, satuan, status_siaga, timestamp.
- **SensorDevice**: id_sensor, nama/lokasi, koordinat (lat, long), threshold_waspada, threshold_siaga, threshold_bahaya, status_aktif.
- **Berita**: id, judul, isi, gambar, kategori, tanggal_publikasi, penulis(admin).
- **Layanan**: id, nama_layanan, deskripsi, persyaratan.
- **DataStatistik**: id, kategori, nilai, periode/tahun.
- **APBDes**: id, pos_anggaran, nilai, tahun_anggaran.

## 11. Asumsi & Batasan

- Warga tidak memerlukan akun; seluruh halaman publik dapat diakses tanpa login.
- Jumlah admin terbatas pada perangkat desa yang berwenang; tidak ada pendaftaran akun mandiri (self-registration).
- Ketersediaan jaringan internet di lokasi pemasangan sensor menjadi prasyarat pengiriman data secara real-time; keterbatasan jaringan dapat memengaruhi frekuensi update data.
- Desain UI/UX final mengacu pada file Figma "PPK ORMAWA" yang telah dibuat tim; PRD ini menjelaskan fungsi di balik setiap halaman pada desain tersebut.
- Notifikasi otomatis (WhatsApp/Telegram) belum termasuk versi 1.0 dan akan dievaluasi pada tahap pengembangan lanjutan.

## 12. Metrik Keberhasilan

- Data ketinggian air dari sensor berhasil diterima dan ditampilkan di dashboard dengan tingkat keberhasilan pengiriman (delivery rate) yang tinggi dan konsisten.
- Admin dapat mempublikasikan berita/pengumuman tanpa kendala teknis berarti.
- Waktu yang dibutuhkan warga untuk mengetahui status siaga terkini dari sejak dibuka halaman monitoring.
- Tingkat akurasi status siaga otomatis dibandingkan pengamatan lapangan oleh perangkat desa.
- Penggunaan halaman Data & Statistik dan Layanan & Kontak sebagai indikator transparansi informasi desa.

## 13. Roadmap Pengembangan

### Versi 1.0 (MVP)
- Seluruh 9 halaman sesuai desain Figma: Beranda, Profil Desa, Monitoring IoT, Berita & Pengumuman, Layanan & Kontak, Data & Statistik, Login, Lupa Password (2 tahap).
- Integrasi data sensor via ESP32 → MQTT broker → backend → dashboard.
- Panel admin dasar untuk kelola berita, threshold, layanan, dan data statistik.

### Versi 1.1+ (Kandidat Pengembangan Lanjutan)
- Notifikasi otomatis (WhatsApp/Telegram bot) saat status siaga naik ke Siaga/Bahaya.
- Layanan pengajuan surat online dengan alur approval bertahap.
- Multi-titik sensor dengan peta agregat seluruh titik pantau di wilayah desa.
- Dashboard analitik lanjutan (prediksi tren kenaikan air berbasis data historis).
