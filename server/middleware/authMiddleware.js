const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [rows] = await db.query('SELECT id, email, first_name, last_name, role_id FROM users WHERE id = ?', [decoded.id]);
      
      if (rows.length === 0) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
      }
      
      req.user = rows[0];

      // --- AÑADIMOS LA RENOVACIÓN DEL TOKEN ---
      // Creamos un nuevo payload sin datos sensibles
      const newPayload = { id: req.user.id, role: req.user.role_id };
      const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
      });

      // Enviamos el nuevo token en una cabecera personalizada
      res.setHeader('X-Refreshed-Token', newToken);
      // ------------------------------------------

      next();
    } catch (error) {
      // Si el error es porque el token ha expirado, enviamos un mensaje claro
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

module.exports = { protect };