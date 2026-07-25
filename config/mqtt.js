const mqtt = require('mqtt');

// Gunakan broker publik untuk development jika tidak ada broker lokal
// Contoh broker publik: mqtt://broker.emqx.io atau mqtt://test.mosquitto.org
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const client = mqtt.connect(`${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `nogosari_be_${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${MQTT_BROKER}:${MQTT_PORT}`);
});

client.on('error', (err) => {
  console.error('MQTT Connection Error:', err);
});

module.exports = client;
