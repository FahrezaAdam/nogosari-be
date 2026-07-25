const mqttClient = require('../config/mqtt');
const db = require('../config/db');

// Topik yang disubscribe, bisa menggunakan wildcard (+) untuk semua sensor desa nogosari
const TOPIC = 'desa/nogosari/sungai/+/ketinggian';

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

      // Simpan data pembacaan ke database
      await db.query(`
        INSERT INTO sensor_readings (id_sensor, nilai_ketinggian, status_siaga)
        VALUES ($1, $2, $3)
      `, [id_sensor, nilai_ketinggian, status_siaga]);

      // TODO (Future Roadmap): Kirim notifikasi jika status Siaga / Bahaya

    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  });
};

module.exports = { startMqttService };
