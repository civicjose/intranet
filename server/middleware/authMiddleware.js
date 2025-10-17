// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
      }

      // La lógica de renovación de token se ha eliminado para garantizar la estabilidad en producción.
      
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

const admin = (req, res, next) => {
  if (req.user && req.user.role_id === 1) {
    next();
  } else {
    res.status(403);
    next(new Error('Acceso denegado. Se requieren permisos de administrador.'));
  }
};

module.exports = { protect, admin };