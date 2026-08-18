const db = require('../config/db');

// Mendapatkan data pembacaan sensor terbaru
exports.getLatestReading = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT sr.*, sd.nama_lokasi 
      FROM sensor_readings sr
      JOIN sensor_devices sd ON sr.id_sensor = sd.id_sensor
      ORDER BY sr.timestamp DESC LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return res.json({ message: 'Belum ada data sensor.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getLatestReading:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};

// Mendapatkan riwayat pembacaan sensor (bisa di filter berdasar waktu)
exports.getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await db.query(`
      SELECT * FROM sensor_readings 
      ORDER BY timestamp DESC 
      LIMIT $1
    `, [limit]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getHistory:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};

// Mendapatkan daftar perangkat sensor dan threshold-nya
exports.getDevices = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sensor_devices');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getDevices:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};

// Update threshold oleh admin
exports.updateThreshold = async (req, res) => {
  const { id_sensor } = req.params;
  const { threshold_waspada, threshold_siaga, threshold_bahaya } = req.body;

  if (!threshold_waspada || !threshold_siaga || !threshold_bahaya) {
    return res.status(400).json({ error: 'Semua nilai threshold harus diisi.' });
  }

  try {
    const result = await db.query(`
      UPDATE sensor_devices 
      SET threshold_waspada = $1, threshold_siaga = $2, threshold_bahaya = $3
      WHERE id_sensor = $4 RETURNING *
    `, [threshold_waspada, threshold_siaga, threshold_bahaya, id_sensor]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sensor tidak ditemukan.' });
    }

    res.json({
      message: 'Threshold berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updateThreshold:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};

