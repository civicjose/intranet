// server/controllers/ticketController.js
const glpiService = require('../services/glpiService'); // La ruta es relativa a este archivo

// Obtener los tickets del usuario logueado
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await glpiService.getUserTickets(req.user.email);
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

// Obtener el detalle de un ticket
exports.getTicketById = async (req, res, next) => {
  try {
    const ticketDetails = await glpiService.getTicketDetails(req.params.id);
    res.status(200).json(ticketDetails);
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo ticket
exports.createTicket = async (req, res, next) => {
  try {
    const newTicket = await glpiService.createTicket(req.user.email, req.body);
    res.status(201).json(newTicket);
  } catch (error) {
    next(error);
  }
};