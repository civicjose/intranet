// server/controllers/locationController.js
const Location = require('../models/locationModel');

exports.getAll = async (req, res, next) => {
    try {
        const items = await Location.getAll();
        res.status(200).json(items);
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    // CORRECCIÓN: El modelo de Location SÍ espera un objeto, por lo que req.body está bien,
    // pero añadimos validación.
    const { name, type } = req.body;
    if (!name || !type) {
        res.status(400);
        return next(new Error('El nombre y el tipo de ubicación son requeridos.'));
    }
    try {
        const newItem = await Location.create(req.body);
        res.status(201).json(newItem);
    } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
    const { name, type } = req.body;
    if (!name || !type) {
        res.status(400);
        return next(new Error('El nombre y el tipo de ubicación son requeridos.'));
    }
    try {
        const updatedItem = await Location.update(req.params.id, req.body);
        res.status(200).json(updatedItem);
    } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
    try {
        await Location.delete(req.params.id);
        res.status(200).json({ message: 'Ubicación eliminada correctamente.' });
    } catch (error) {
        if (error.message.includes('asignados')) {
            res.status(400);
        }
        next(error);
    }
};