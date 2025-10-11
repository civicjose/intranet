// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

const {
    getUserProfile,
    updateUserProfile, // 1. Importa la nueva función
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar
} = require('../controllers/userController');

const { protect, admin } = require('../middleware/authMiddleware');

// --- RUTA PARA EL PROPIO USUARIO ---
// GET /api/users/me -> Obtener perfil
// PUT /api/users/me -> Actualizar perfil
router.route('/me')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile); // 2. Añade el manejador PUT

router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);


// --- RUTAS DE ADMINISTRACIÓN ---
router.get('/', protect, admin, getAllUsers);
router.post('/', protect, admin, createUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;