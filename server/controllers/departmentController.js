// server/controllers/departmentController.js
const Department = require('../models/departmentModel');

/**
 * @desc    Obtener todos los departamentos
 * @route   GET /api/departments
 * @access  Public
 */
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.getAll();
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un departamento (Admin)
 * @route   POST /api/departments
 * @access  Private/Admin
 */
exports.createDepartment = async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del departamento es requerido.'));
    }
    try {
        // CORRECCIÓN: Usamos el modelo para la validación, no 'db' directamente.
        const departmentExists = await Department.findByName(name);
        if (departmentExists) {
            res.status(400);
            throw new Error('Ya existe un departamento con ese nombre.');
        }
        const newDepartment = await Department.create(name);
        res.status(201).json(newDepartment);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar un departamento (Admin)
 * @route   PUT /api/departments/:id
 * @access  Private/Admin
 */
exports.updateDepartment = async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del departamento es requerido.'));
    }
    try {
        const updatedDepartment = await Department.update(id, name);
        res.status(200).json(updatedDepartment);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Borrar un departamento (Admin)
 * @route   DELETE /api/departments/:id
 * @access  Private/Admin
 */
exports.deleteDepartment = async (req, res, next) => {
    const { id } = req.params;
    try {
        await Department.delete(id);
        res.status(200).json({ message: 'Departamento eliminado correctamente.' });
    } catch (error) {
        // Capturamos el error específico del modelo si hay usuarios asignados
        if (error.message.includes('usuarios asignados')) {
            res.status(400);
        }
        next(error);
    }
};