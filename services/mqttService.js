const mqttClient = require('../config/mqtt');
const db = require('../config/db');

// Topik yang disubscribe:
// 1. water_level/jarak (Format kode ESP32 DYPA16 Anda)
// 2. desa/nogosari/sungai/+/ketinggian (Format standar)
const TOPICS = [
  'water_level/jarak',
  'desa/nogosari/sungai/+/ketinggian'
];

// Cache sederhana untuk menyimpan waktu & nilai pembacaan terakhir per sensor
const lastReadings = {};

const startMqttService = () => {
  mqttClient.on('connect', () => {
    TOPICS.forEach((topic) => {
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to topic ${topic}:`, err);
        } else {
          console.log(`Subscribed to MQTT topic: ${topic}`);
        }
      });
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const messageStr = message.toString().trim();
      console.log(`Received MQTT message on ${topic}:`, messageStr);

      let id_sensor = 'SN-001';
      let nilai_ketinggian; // dalam centimeter (cm)

      // Cek apakah pesan berupa JSON atau angka langsung (format ESP32 DYPA16)
      if (topic === 'water_level/jarak') {
        const jarakM = parseFloat(messageStr);
        if (isNaN(jarakM)) {
          console.error('Payload water_level/jarak tidak valid:', messageStr);
          return;
        }
        // Konversi dari meter ke centimeter untuk konsistensi database (misal 1.50m -> 150cm)
        nilai_ketinggian = parseFloat((jarakM * 100).toFixed(2));
      } else {
        // Format JSON standar: { "id_sensor": "SN-001", "nilai_ketinggian": 120.5 }
        const payload = JSON.parse(messageStr);
        id_sensor = payload.id_sensor || 'SN-001';
        nilai_ketinggian = payload.nilai_ketinggian;
      }

      if (nilai_ketinggian === undefined || isNaN(nilai_ketinggian)) {
        console.error('Nilai ketinggian tidak valid:', messageStr);
        return;
      }

      // Ambil threshold dari database untuk menentukan status siaga
      const deviceResult = await db.query('SELECT * FROM sensor_devices WHERE id_sensor = $1', [id_sensor]);
      
      if (deviceResult.rows.length === 0) {
        console.error(`Sensor ${id_sensor} tidak terdaftar di database.`);
        return;
      }

      const device = deviceResult.rows[0];
      const val = Number(nilai_ketinggian);
      const thWaspada = Number(device.threshold_waspada);
      const thSiaga = Number(device.threshold_siaga);
      const thBahaya = Number(device.threshold_bahaya);

      let status_siaga = 'Aman';

      // Cek mode ultrasonik (semakin kecil jarak = semakin dekat air = bahaya)
      // Default dari kode ESP32: Bahaya <= 60cm (0.60m), Siaga <= 150cm (1.50m)
      const isDistanceMode = thBahaya < thWaspada || topic === 'water_level/jarak';

      if (isDistanceMode) {
        // Mengikuti ambang batas ESP32: Bahaya <= 60cm, Siaga <= 150cm
        const limitBahaya = thBahaya < thWaspada ? thBahaya : 60.0;
        const limitSiaga = thSiaga < thWaspada ? thSiaga : 150.0;

        if (val <= limitBahaya) {
          status_siaga = 'Bahaya';
        } else if (val <= limitSiaga) {
          status_siaga = 'Siaga';
        } else {
          status_siaga = 'Aman';
        }
      } else {
        if (val >= thBahaya) {
          status_siaga = 'Bahaya';
        } else if (val >= thSiaga) {
          status_siaga = 'Siaga';
        } else if (val >= thWaspada) {
          status_siaga = 'Waspada';
        } else {
          status_siaga = 'Aman';
        }
      }

      // === SMART THROTTLING (Penghemat DB Neon) ===
      const last = lastReadings[id_sensor];
      const now = Date.now();
      const MIN_INTERVAL_AMAN = 5 * 60 * 1000; // Simpan minimal 5 menit sekali jika status Aman
      const MIN_INTERVAL_WARNING = 5 * 1000;   // Simpan minimal 5 detik sekali jika Siaga/Bahaya

      if (last) {
        const timeDiff = now - last.time;
        const heightDiff = Math.abs(nilai_ketinggian - last.ketinggian);

        // Jika status Aman & belum 5 menit & perubahan air < 1 cm -> Abaikan simpan ke DB
        if (status_siaga === 'Aman' && timeDiff < MIN_INTERVAL_AMAN && heightDiff < 1.0) {
          return;
        }

        // Jika Siaga/Bahaya tapi pengiriman < 5 detik -> Abaikan simpan
        if (status_siaga !== 'Aman' && timeDiff < MIN_INTERVAL_WARNING) {
          return;
        }
      }

      // Simpan data pembacaan ke database
      await db.query(`
        INSERT INTO sensor_readings (id_sensor, nilai_ketinggian, status_siaga)
        VALUES ($1, $2, $3)
      `, [id_sensor, nilai_ketinggian, status_siaga]);

      console.log(`Saved reading to DB: ${id_sensor} -> ${nilai_ketinggian} cm (${status_siaga})`);

      // Update cache data terakhir
      lastReadings[id_sensor] = {
        time: now,
        ketinggian: nilai_ketinggian,
        status: status_siaga
      };

    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  });
};

module.exports = { startMqttService };
