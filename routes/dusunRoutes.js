const express = require('express');
const router = express.Router();
const dusunController = require('../controllers/dusunController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route Publik
router.get('/', dusunController.getAll);
router.get('/:id', dusunController.getById);

// Route Admin (Butuh Auth)
router.post('/', authMiddleware, dusunController.create);
router.put('/:id', authMiddleware, dusunController.update);
router.delete('/:id', authMiddleware, dusunController.delete);

module.exports = router;
