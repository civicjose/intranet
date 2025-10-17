// server/controllers/positionController.js
const Position = require('../models/positionModel');

exports.getAll = async (req, res, next) => {
    try {
        const items = await Position.getAll();
        res.status(200).json(items);
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del puesto es requerido.'));
    }
    try {
        const newItem = await Position.create(name);
        res.status(201).json(newItem);
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del puesto es requerido.'));
    }
    try {
        const updatedItem = await Position.update(req.params.id, name);
        res.status(200).json(updatedItem);
    } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
    try {
        await Position.delete(req.params.id);
        res.status(200).json({ message: 'Puesto eliminado correctamente.' });
    } catch (error) {
        if (error.message.includes('asignados')) {
            res.status(400);
        }
        next(error);
    }
};