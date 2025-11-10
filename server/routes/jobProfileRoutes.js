// server/routes/jobProfileRoutes.js
const express = require('express');
const router = express.Router();

// Importa todas las funciones del controlador
const { 
    getMyProfile, 
    getProfileForUser, 
    upsertProfile, 
    deleteProfile, 
    downloadWordProfile
} = require('../controllers/jobProfileController');

// Importa tu middleware de autenticación
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas de fichas de puesto requieren que el usuario esté logueado
router.use(protect);

// Ruta para que un empleado obtenga su propia ficha
router.get('/my-profile', getMyProfile);

// Ruta para que un supervisor obtenga la ficha de un miembro de su equipo
router.get('/for-user/:userId', getProfileForUser);

// Ruta para que un supervisor cree o actualice una ficha (usa POST para ambos casos)
router.post('/', upsertProfile);

// Ruta para eliminar una ficha
router.delete('/:userId', deleteProfile);

// --- RUTA NUEVA Y CORREGIDA ---
// Ruta para descargar el DOCX (usa 'protect' en lugar de 'authenticateToken')
router.get(
    '/download-word/:userId',
    protect, // <- Esta es la corrección
    downloadWordProfile
);

module.exports = router;