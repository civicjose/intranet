// server/controllers/roleController.js
const Role = require('../models/roleModel');

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.getAll();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};