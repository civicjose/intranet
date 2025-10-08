const db = require('../config/database');

/**
 * @desc    Obtener todos los departamentos
 * @route   GET /api/departments
 * @access  Public
 */
exports.getDepartments = async (req, res) => {
  try {
    const [departments] = await db.query('SELECT id, name FROM departments ORDER BY name ASC');
    res.status(200).json(departments);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};