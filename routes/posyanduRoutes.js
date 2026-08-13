const express = require('express');
const router = express.Router();
const posyanduController = require('../controllers/posyanduController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route Publik
router.get('/', posyanduController.getAll);
router.get('/:id', posyanduController.getById);

// Route Admin (Butuh Auth)
router.post('/', authMiddleware, posyanduController.create);
router.put('/:id', authMiddleware, posyanduController.update);
router.delete('/:id', authMiddleware, posyanduController.delete);

module.exports = router;
