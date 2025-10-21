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
    const { name, area_id, order_index } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del departamento es requerido.'));
    }
    try {
        const newDepartment = await Department.create({ name, area_id, order_index });
        res.status(201).json(newDepartment);
    } catch (error) {
        next(error);
    }
};

exports.updateDepartment = async (req, res, next) => {
    const { id } = req.params;
    const { name, area_id, order_index } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del departamento es requerido.'));
    }
    try {
        const updatedDepartment = await Department.update(id, { name, area_id, order_index });
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

exports.reorder = async (req, res, next) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: 'Se esperaba un array de IDs.' });
    }
    try {
        await Department.reorder(orderedIds);
        res.status(200).json({ message: 'Orden de departamentos actualizado correctamente.' });
    } catch (error) {
        next(error);
    }
};