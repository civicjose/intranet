// server/routes/jobProfileRoutes.js
const express = require('express');
const router = express.Router();

const { getMyProfile, getProfileForUser, upsertProfile, deleteProfile } = require('../controllers/jobProfileController');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas de fichas de puesto requieren que el usuario esté logueado
router.use(protect);

// Ruta para que un empleado obtenga su propia ficha
router.get('/my-profile', getMyProfile);

// Ruta para que un supervisor obtenga la ficha de un miembro de su equipo
router.get('/for-user/:userId', getProfileForUser);

// Ruta para que un supervisor cree o actualice una ficha (usa POST para ambos casos)
router.post('/', upsertProfile);

router.delete('/:userId', deleteProfile);

module.exports = router;