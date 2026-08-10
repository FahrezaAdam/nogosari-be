const mqttClient = require('../config/mqtt');
const db = require('../config/db');

// Topik yang disubscribe, bisa menggunakan wildcard (+) untuk semua sensor desa nogosari
const TOPIC = 'desa/nogosari/sungai/+/ketinggian';

// Cache sederhana untuk menyimpan waktu & nilai pembacaan terakhir per sensor
const lastReadings = {};

const startMqttService = () => {
  mqttClient.on('connect', () => {
    mqttClient.subscribe(TOPIC, (err) => {
      if (err) {
        console.error('Failed to subscribe to topic:', err);
      } else {
        console.log(`Subscribed to MQTT topic: ${TOPIC}`);
      }
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      // Asumsi payload berupa JSON: { "id_sensor": "SN-001", "nilai_ketinggian": 120.5 }
      const payload = JSON.parse(message.toString());
      console.log(`Received MQTT message on ${topic}:`, payload);

      const { id_sensor, nilai_ketinggian } = payload;
      
      if (!id_sensor || nilai_ketinggian === undefined) {
        console.error('Payload MQTT tidak valid:', payload);
        return;
      }

      // Ambil threshold dari database untuk menentukan status siaga
      const deviceResult = await db.query('SELECT * FROM sensor_devices WHERE id_sensor = $1', [id_sensor]);
      
      if (deviceResult.rows.length === 0) {
        console.error(`Sensor ${id_sensor} tidak terdaftar di database.`);
        return; // Abaikan data jika sensor tidak terdaftar
      }

      const device = deviceResult.rows[0];
      let status_siaga = 'Aman';

      if (nilai_ketinggian >= device.threshold_bahaya) {
        status_siaga = 'Bahaya';
      } else if (nilai_ketinggian >= device.threshold_siaga) {
        status_siaga = 'Siaga';
      } else if (nilai_ketinggian >= device.threshold_waspada) {
        status_siaga = 'Waspada';
      }

      // === SMART THROTTLING (Penghemat DB Neon) ===
      const last = lastReadings[id_sensor];
      const now = Date.now();
      const MIN_INTERVAL_AMAN = 5 * 60 * 1000; // Minimal simpan 5 menit sekali jika status Aman
      const MIN_INTERVAL_WARNING = 10 * 1000;  // Minimal simpan 10 detik sekali jika Waspada/Siaga/Bahaya

      if (last) {
        const timeDiff = now - last.time;
        const heightDiff = Math.abs(nilai_ketinggian - last.ketinggian);

        // Jika status Aman DAN belum 5 menit DAN perubahan air kurang dari 0.5 cm -> Abaikan simpan ke DB
        if (status_siaga === 'Aman' && timeDiff < MIN_INTERVAL_AMAN && heightDiff < 0.5) {
          console.log(`⏳ [THROTTLED] Skip insert for ${id_sensor}: Water status 'Aman' & small change (${heightDiff} cm)`);
          return;
        }

        // Jika status Waspada/Siaga/Bahaya tapi jarak pengiriman < 10 detik -> Abaikan simpan
        if (status_siaga !== 'Aman' && timeDiff < MIN_INTERVAL_WARNING) {
          return;
        }
      }

      // Simpan data pembacaan ke database
      await db.query(`
        INSERT INTO sensor_readings (id_sensor, nilai_ketinggian, status_siaga)
        VALUES ($1, $2, $3)
      `, [id_sensor, nilai_ketinggian, status_siaga]);

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
