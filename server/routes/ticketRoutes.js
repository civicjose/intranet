// server/routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const { getMyTickets, getTicketById, createTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas de tickets requieren que el usuario esté logueado
router.use(protect);

router.get('/', getMyTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);

module.exports = router;