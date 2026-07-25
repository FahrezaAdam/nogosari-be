require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Route Imports
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const rentanBanjirRoutes = require('./routes/rentanBanjirRoutes');
const pengaduanRoutes = require('./routes/pengaduanRoutes');

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Setup Swagger Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/api/rentan-banjir', rentanBanjirRoutes);
app.use('/api/pengaduan', pengaduanRoutes);
// TODO: app.use('/api/layanan', layananRoutes);
// TODO: app.use('/api/statistik', statistikRoutes);

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

// Start MQTT Service
startMqttService();

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Export app untuk Vercel Serverless Functions
module.exports = app;
