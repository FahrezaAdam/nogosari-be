const db = require('../config/db');

// Fungsi pembersihan otomatis data lama (> 30 hari)
const cleanupOldReadings = async () => {
  try {
    const result = await db.query(
      "DELETE FROM sensor_readings WHERE timestamp < NOW() - INTERVAL '30 days' RETURNING id"
    );
    if (result.rowCount > 0) {
      console.log(`🧹 [AUTO-CLEANUP] Deleted ${result.rowCount} old sensor readings older than 30 days.`);
    }
  } catch (error) {
    console.error('❌ [AUTO-CLEANUP ERROR] Failed to clean old sensor readings:', error);
  }
};

// Jalankan cleanup saat server pertama kali dinyalakan & setiap 24 jam sekali
const startCleanupCron = () => {
  cleanupOldReadings(); // Jalankan sekali saat startup
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(cleanupOldReadings, TWENTY_FOUR_HOURS);
};

module.exports = { cleanupOldReadings, startCleanupCron };
