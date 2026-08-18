const mqtt = require('mqtt');

const MQTT_BROKER = process.env.MQTT_BROKER;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const client = mqtt.connect(MQTT_BROKER, {
  clientId: `nogosari_be_${Math.random().toString(16).slice(3)}`,
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  clean: true,
  connectTimeout: 5000,
  reconnectPeriod: 2000,
  rejectUnauthorized: true,
});

client.on('connect', () => {
  console.log(`Connected to MQTT broker: ${MQTT_BROKER}`);
});

client.on('error', (err) => {
  console.error('MQTT Connection Error:', err);
});

module.exports = client;
