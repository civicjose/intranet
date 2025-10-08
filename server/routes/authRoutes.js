const express = require('express');
const router = express.Router();

// Importamos la función del controlador que hemos creado
const { checkEmail, verifyCode, completeRegistration, loginUser } = require('../controllers/authController');

// Definimos la ruta POST y la asociamos con nuestra función
// Cuando llegue una petición POST a '/api/auth/check-email', se ejecutará checkEmail
router.post('/check-email', checkEmail);
router.post('/verify-code', verifyCode);
router.post('/complete-registration', completeRegistration);
router.post('/login', loginUser);

// Exportamos el router para poder usarlo en nuestro archivo principal del servidor
module.exports = router;