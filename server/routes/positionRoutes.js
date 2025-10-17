// server/routes/areaRoutes.js
const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/')
  .get(positionController.getAll)
  .post(positionController.create);

router.route('/:id')
  .put(positionController.update)
  .delete(positionController.delete);

module.exports = router;