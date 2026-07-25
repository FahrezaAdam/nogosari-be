const express = require('express');
const router = express.Router();
const beritaController = require('../controllers/beritaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', beritaController.getAll);
router.get('/:id', beritaController.getById);

// Admin Only
router.post('/', authMiddleware, beritaController.create);
router.put('/:id', authMiddleware, beritaController.update);
router.delete('/:id', authMiddleware, beritaController.delete);

module.exports = router;
