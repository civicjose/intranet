// server/routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getAllNews, 
    getPublishedNews, 
    getNewsById,
    createNews, 
    updateNews, 
    deleteNews
} = require('../controllers/newsController');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/image-upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
  }
  // Devuelve la URL pública del archivo guardado
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// --- RUTAS PÚBLICAS (para usuarios logueados) ---
router.get('/published', protect, getPublishedNews);

// --- RUTAS DE ADMINISTRACIÓN ---
router.route('/')
    .get(protect, admin, getAllNews)
    .post(protect, admin, createNews);

router.route('/:id')
    .get(protect, admin, getNewsById)
    .put(protect, admin, updateNews)
    .delete(protect, admin, deleteNews);

module.exports = router;