// server/controllers/departmentController.js
const Department = require('../models/departmentModel');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.getAll();
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
    // MODIFICACIÓN: Aceptamos area_id del body
    const { name, area_id } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del departamento es requerido.'));
    }
    try {
        const departmentExists = await Department.findByName(name);
        if (departmentExists) {
            res.status(400);
            throw new Error('Ya existe un departamento con ese nombre.');
        }
        // Pasamos el objeto completo al modelo
        const newDepartment = await Department.create({ name, area_id });
        res.status(201).json(newDepartment);
    } catch (error) {
        next(error);
    }
};

exports.updateDepartment = async (req, res, next) => {
    const { id } = req.params;
    // MODIFICACIÓN: Aceptamos area_id del body
    const { name, area_id } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del departamento es requerido.'));
    }
    try {
        // Pasamos el objeto completo al modelo
        const updatedDepartment = await Department.update(id, { name, area_id });
        res.status(200).json(updatedDepartment);
    } catch (error) {
        next(error);
    }
};

exports.deleteDepartment = async (req, res, next) => {
    const { id } = req.params;
    try {
        await Department.delete(id);
        res.status(200).json({ message: 'Departamento eliminado correctamente.' });
    } catch (error) {
        if (error.message.includes('usuarios asignados')) {
            res.status(400);
        }
        next(error);
    }
};