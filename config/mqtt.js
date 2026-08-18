const mqtt = require('mqtt');

const MQTT_BROKER = process.env.MQTT_BROKER || 'wss://2fe780a2e3024f5795317b7f121248a1.s1.eu.hivemq.cloud:8884/mqtt';
const MQTT_USERNAME = process.env.MQTT_USERNAME || 'PPKORMAWA123';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || 'ppkews123';

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
