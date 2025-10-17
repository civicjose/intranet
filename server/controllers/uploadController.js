// server/controllers/uploadController.js
const path = require('path');

/**
 * @desc    Maneja la subida de un único archivo de imagen
 * @route   POST /api/upload
 * @access  Private
 */
exports.uploadImage = (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No se ha subido ningún archivo.");
    }

    // Devuelve la ruta relativa donde se guardó el archivo
    const filePath = `/uploads/${req.file.filename}`;
    
    res.status(201).json({
      message: "Imagen subida correctamente.",
      url: filePath,
    });
  } catch (error) {
    next(error);
  }
};