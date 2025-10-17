// server/routes/areaRoutes.js
const express = require('express');
const router = express.Router();
const territoryController = require('../controllers/territoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/')
  .get(territoryController.getAll)
  .post(territoryController.create);

router.route('/:id')
  .put(territoryController.update)
  .delete(territoryController.delete);

module.exports = router;