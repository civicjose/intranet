/**
 * @desc    Obtener los datos del perfil del usuario logueado y sus departamentos
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  // Gracias al middleware, ya tenemos los datos básicos del usuario en req.user
  if (req.user) {
    try {
      // --- AÑADIMOS ESTA CONSULTA ---
      // Buscamos en la tabla user_departments todas las asignaciones para este usuario
      const [departmentsRows] = await db.query(
        `SELECT d.id, d.name 
         FROM departments d
         JOIN user_departments ud ON d.id = ud.department_id
         WHERE ud.user_id = ?`,
        [req.user.id]
      );
      
      // Añadimos la lista de departamentos al objeto de usuario que devolvemos
      const userProfile = {
        ...req.user,
        departments: departmentsRows, // Será un array, vacío si no tiene asignaciones
      };

      res.status(200).json(userProfile);
      
    } catch (error) {
      console.error('Error al obtener los departamentos del usuario:', error);
      res.status(500).json({ message: 'Error del servidor.' });
    }
  } else {
    res.status(404).json({ message: 'Usuario no encontrado.' });
  }
};