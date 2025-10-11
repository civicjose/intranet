// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Usamos el modelo para obtener datos frescos

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Usamos el modelo para obtener los datos del usuario, incluyendo el rol
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
      }

      // La renovación del token se queda igual
      const newPayload = { id: req.user.id, role: req.user.role_id };
      const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
      });
      res.setHeader('X-Refreshed-Token', newToken);

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Sesión expirada, por favor inicia sesión de nuevo.' });
      }
      return res.status(401).json({ message: 'No autorizado, token fallido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token.' });
  }
};

// --- NUEVO MIDDLEWARE DE ADMINISTRADOR ---
const admin = (req, res, next) => {
  // Este middleware SIEMPRE debe ejecutarse DESPUÉS de 'protect'
  // Comprobamos si el usuario existe y si su role_id es 1 (admin)
  if (req.user && req.user.role_id === 1) {
    next(); // Es admin, puede continuar
  } else {
    res.status(403); // 403 Forbidden: sabe quién eres, pero no tienes permiso
    // Usamos 'next' con un error para pasarlo a un futuro manejador de errores
    next(new Error('Acceso denegado. Se requieren permisos de administrador.'));
  }
};

module.exports = { protect, admin };