// server/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getAllCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Rutas para el CRUD de categorías, protegidas para administradores
router.route('/')
    .get(protect, admin, getAllCategories)
    .post(protect, admin, createCategory);

router.route('/:id')
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

module.exports = router;