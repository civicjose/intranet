// server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // La carpeta donde se guardarán las imágenes
  },
  filename(req, file, cb) {
    // Genera un nombre de archivo único para evitar colisiones
    cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filtro para asegurarse de que solo se suban imágenes
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('¡Solo se permiten imágenes (jpg, jpeg, png)!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;