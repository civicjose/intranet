// server/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getDepartments, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment 
} = require('../controllers/departmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// La ruta raíz ahora maneja GET (público o protegido, según prefieras) y POST (admin)
router.route('/')
    .get(getDepartments) 
    .post(protect, admin, createDepartment);

// Las rutas con ID manejan PUT y DELETE (admin)
router.route('/:id')
    .put(protect, admin, updateDepartment)
    .delete(protect, admin, deleteDepartment);

module.exports = router;