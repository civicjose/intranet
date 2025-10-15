// server/controllers/eventController.js
const Event = require('../models/eventModel');

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.getAll();
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  const { title, start_date } = req.body;
  if (!title || !start_date) {
    res.status(400);
    return next(new Error('El título y la fecha de inicio son requeridos.'));
  }
  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
};

// --- NUEVO: Controlador para actualizar ---
exports.updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const { title, start_date } = req.body;
  if (!title || !start_date) {
    res.status(400);
    return next(new Error('El título y la fecha de inicio son requeridos.'));
  }
  try {
    await Event.update(id, req.body);
    res.status(200).json({ message: 'Evento actualizado correctamente.' });
  } catch (error) {
    next(error);
  }
};

// --- NUEVO: Controlador para borrar ---
exports.deleteEvent = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Event.delete(id);
    res.status(200).json({ message: 'Evento eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};