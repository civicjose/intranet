// server/controllers/areaController.js
const Area = require('../models/areaModel');

exports.getAll = async (req, res, next) => {
    try {
        const items = await Area.getAll();
        res.status(200).json(items);
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    // CORRECCIÓN: Extraemos 'name' del body antes de pasarlo al modelo.
    const { name } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del área es requerido.'));
    }
    try {
        const newItem = await Area.create(name);
        res.status(201).json(newItem);
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    // CORRECCIÓN: Extraemos 'name' del body.
    const { name } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del área es requerido.'));
    }
    try {
        const updatedItem = await Area.update(req.params.id, name);
        res.status(200).json(updatedItem);
    } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
    try {
        await Area.delete(req.params.id);
        res.status(200).json({ message: 'Área eliminada correctamente.' });
    } catch (error) {
        if (error.message.includes('asignados')) {
            res.status(400);
        }
        next(error);
    }
};