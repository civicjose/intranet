// server/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// La clave 'image' debe coincidir con la que se usa en el FormData del frontend
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;