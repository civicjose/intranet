// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

const {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar,
    getMyTeam,
    reorderUsers // Importa el nuevo controlador
} = require('../controllers/userController');

const { protect, admin } = require('../middleware/authMiddleware');

// --- RUTA PARA EL PROPIO USUARIO ---
router.route('/me')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);

// --- RUTA PARA "MI EQUIPO" ---
router.get('/my-team', protect, getMyTeam);

// --- RUTAS DE ADMINISTRACIÓN ---
router.put('/reorder', protect, admin, reorderUsers); // Añade la nueva ruta

router.get('/', protect, admin, getAllUsers);
router.post('/', protect, admin, createUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;