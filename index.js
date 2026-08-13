require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { startMqttService } = require('./services/mqttService');
const { startCleanupCron } = require('./services/cleanupService');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const rentanBanjirRoutes = require('./routes/rentanBanjirRoutes');
const posyanduRoutes = require('./routes/posyanduRoutes');
const pengaduanRoutes = require('./routes/pengaduanRoutes');

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Setup Swagger Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
  ]
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/api/rentan-banjir', rentanBanjirRoutes);
app.use('/api/posyandu', posyanduRoutes);
app.use('/api/pengaduan', pengaduanRoutes);

app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      message: 'Nogosari Backend API is Running',
      db_time: result.rows[0].now
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Start MQTT Service & Auto-Cleanup (Skip on Vercel to prevent function hang)
if (!process.env.VERCEL) {
  startMqttService();
  startCleanupCron();
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
