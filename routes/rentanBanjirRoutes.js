const express = require('express');
const router = express.Router();
const rentanBanjirController = require('../controllers/rentanBanjirController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route Publik
router.get('/', rentanBanjirController.getAll);
router.get('/posyandu', rentanBanjirController.getPosyanduList);
router.get('/kategori', rentanBanjirController.getKategoriList);
router.get('/summary', rentanBanjirController.getSummary);

// Route Admin (Butuh Auth)
router.post('/batch', authMiddleware, rentanBanjirController.saveBatch);
router.post('/posyandu', authMiddleware, rentanBanjirController.createPosyandu);
router.post('/', authMiddleware, rentanBanjirController.create);
router.put('/:id', authMiddleware, rentanBanjirController.update);
router.delete('/:id', authMiddleware, rentanBanjirController.delete);

module.exports = router;
