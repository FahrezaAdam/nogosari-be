const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route Publik
router.get('/latest', sensorController.getLatestReading);
router.get('/history', sensorController.getHistory);
router.get('/devices', sensorController.getDevices);

// Route Admin (Butuh Auth)
router.put('/devices/:id_sensor/threshold', authMiddleware, sensorController.updateThreshold);

module.exports = router;
