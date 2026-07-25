const express = require('express');
const router = express.Router();
const pengaduanController = require('../controllers/pengaduanController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route Publik (Warga)
router.post('/', pengaduanController.create); // Mengirim pengaduan

// Route Admin (Butuh Auth)
router.get('/', authMiddleware, pengaduanController.getAll); // Melihat semua pengaduan
router.delete('/:id', authMiddleware, pengaduanController.delete); // Menghapus pengaduan

module.exports = router;
