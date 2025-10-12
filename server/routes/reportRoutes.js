// server/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getMyReports, 
    getReportEmbedUrl,
    getAllReports,
    createReport,
    updateReport,
    deleteReport,
    getReportById
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- RUTAS PARA USUARIO FINAL ---
router.get('/my', protect, getMyReports);
router.get('/:id/embed-url', protect, getReportEmbedUrl);

// --- RUTAS PARA ADMINISTRACIÓN ---
router.route('/')
    .get(protect, admin, getAllReports)
    .post(protect, admin, createReport);

router.route('/:id')
    .get(protect, admin, getReportById)
    .put(protect, admin, updateReport)
    .delete(protect, admin, deleteReport);

module.exports = router;