// server/controllers/areaController.js
const Area = require('../models/areaModel');

exports.getAll = async (req, res, next) => {
    try {
        const items = await Area.getAll();
        res.status(200).json(items);
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    const { name, division_id, order_index } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del área es requerido.'));
    }
    try {
        const newItem = await Area.create({ name, division_id, order_index });
        res.status(201).json(newItem);
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    const { name, division_id, order_index } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del área es requerido.'));
    }
    try {
        const updatedItem = await Area.update(req.params.id, { name, division_id, order_index });
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

exports.reorder = async (req, res, next) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: 'Se esperaba un array de IDs.' });
    }
    try {
        await Area.reorder(orderedIds);
        res.status(200).json({ message: 'Orden de áreas actualizado correctamente.' });
    } catch (error) {
        next(error);
    }
};