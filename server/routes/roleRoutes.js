// server/routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const { getRoles } = require('../controllers/roleController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/roles - Protegida para administradores
router.get('/', protect, admin, getRoles);

module.exports = router;