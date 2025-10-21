// server/controllers/divisionController.js
const Division = require('../models/divisionModel');

exports.getAll = async (req, res, next) => {
    try {
        const items = await Division.getAll();
        res.status(200).json(items);
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    const { name, order_index } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'El nombre de la división es requerido.' });
    }
    try {
        const newItem = await Division.create({ name, order_index });
        res.status(201).json(newItem);
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    const { name, order_index } = req.body;
     if (!name) {
        return res.status(400).json({ message: 'El nombre de la división es requerido.' });
    }
    try {
        const updatedItem = await Division.update(req.params.id, { name, order_index });
        res.status(200).json(updatedItem);
    } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
    try {
        await Division.delete(req.params.id);
        res.status(200).json({ message: 'División eliminada correctamente.' });
    } catch (error) {
        if (error.message.includes('asignadas')) {
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
        await Division.reorder(orderedIds);
        res.status(200).json({ message: 'Orden actualizado correctamente.' });
    } catch (error) {
        next(error);
    }
};