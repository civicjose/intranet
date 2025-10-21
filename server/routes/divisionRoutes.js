// server/routes/divisionRoutes.js
const express = require('express');
const router = express.Router();
const divisionController = require('../controllers/divisionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protege todas las rutas de divisiones para que solo los admins puedan acceder
router.use(protect, admin);

router.route('/')
  .get(divisionController.getAll)
  .post(divisionController.create);

router.put('/reorder', divisionController.reorder);

router.route('/:id')
  .put(divisionController.update)
  .delete(divisionController.delete);

module.exports = router;