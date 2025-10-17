// server/controllers/territoryController.js
const Territory = require('../models/territoryModel');

exports.getAll = async (req, res, next) => {
    try {
        const items = await Territory.getAll();
        res.status(200).json(items);
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        return next(new Error('El nombre del territorio es requerido.'));
    }
    try {
        const newItem = await Territory.create(name);
        res.status(201).json(newItem);
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    const { name } = req.body;
     if (!name) {
        res.status(400);
        return next(new Error('El nombre del territorio es requerido.'));
    }
    try {
        const updatedItem = await Territory.update(req.params.id, name);
        res.status(200).json(updatedItem);
    } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
    try {
        await Territory.delete(req.params.id);
        res.status(200).json({ message: 'Territorio eliminado correctamente.' });
    } catch (error) {
        if (error.message.includes('asignados')) {
            res.status(400);
        }
        next(error);
    }
};