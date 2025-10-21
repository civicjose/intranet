// server/routes/areaRoutes.js
const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/')
  .get(areaController.getAll)
  .post(areaController.create);

router.put('/reorder', areaController.reorder);

router.route('/:id')
  .put(areaController.update)
  .delete(areaController.delete);

module.exports = router;