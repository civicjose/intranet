// server/controllers/categoryController.js
const Category = require('../models/categoryModel');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.getAll();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    return next(new Error('El nombre de la categoría es requerido.'));
  }
  try {
    const categoryExists = await Category.findByName(name);
    if (categoryExists) {
      res.status(400);
      throw new Error('Ya existe una categoría con ese nombre.');
    }
    const newCategory = await Category.create(name);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    res.status(400);
    return next(new Error('El nombre de la categoría es requerido.'));
  }
  try {
    await Category.update(id, name);
    res.status(200).json({ id, name });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Category.delete(id);
    res.status(200).json({ message: 'Categoría eliminada correctamente.' });
  } catch (error) {
    // En el futuro, podríamos añadir una comprobación para no borrar categorías en uso
    next(error);
  }
};