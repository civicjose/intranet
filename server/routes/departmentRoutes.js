// server/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getDepartments, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment,
    reorder
} = require('../controllers/departmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getDepartments) 
    .post(protect, admin, createDepartment);

router.put('/reorder', protect, admin, reorder); // <-- Ruta para reordenar

router.route('/:id')
    .put(protect, admin, updateDepartment)
    .delete(protect, admin, deleteDepartment);

module.exports = router;