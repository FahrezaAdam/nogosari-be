const express = require('express');
const router = express.Router();
const rentanBanjirController = require('../controllers/rentanBanjirController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route Publik
router.get('/', rentanBanjirController.getAll);

// Route Admin (Butuh Auth)
router.post('/', authMiddleware, rentanBanjirController.create);
router.put('/:id', authMiddleware, rentanBanjirController.update);
router.delete('/:id', authMiddleware, rentanBanjirController.delete);

module.exports = router;
