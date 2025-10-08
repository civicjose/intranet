const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Usamos el middleware 'protect' en esta ruta.
// Esto asegura que solo usuarios con un token válido puedan acceder a ella.
router.get('/me', protect, getUserProfile);

module.exports = router;