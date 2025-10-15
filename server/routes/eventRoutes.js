// server/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllEvents)
  .post(protect, admin, createEvent);

// --- NUEVAS RUTAS PARA EDITAR Y BORRAR ---
router.route('/:id')
  .put(protect, admin, updateEvent)
  .delete(protect, admin, deleteEvent);

module.exports = router;