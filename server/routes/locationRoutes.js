// server/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/')
  .get(locationController.getAll)
  .post(locationController.create);

router.put('/reorder', locationController.reorder);

router.route('/:id')
  .put(locationController.update)
  .delete(locationController.delete);

module.exports = router;