// Cargar las variables de entorno del archivo .env
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Inicializar la aplicación de Express
const app = express();

// Middlewares
app.use(cors()); // Habilita CORS para permitir peticiones desde el frontend
app.use(express.json()); // Permite al servidor entender JSON en el cuerpo de las peticiones

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.json({ message: 'API de Intranet Macrosad funcionando correctamente!' });
});

// --- AÑADIR ESTAS LÍNEAS ---
// Le decimos a Express que use nuestras rutas de autenticación
// Todas las rutas definidas en auth.js tendrán el prefijo '/api/auth'
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const departmentRoutes = require('./routes/departmentRoutes');
app.use('/api/departments', departmentRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Definir el puerto en el que correrá el servidor
// Usamos el puerto definido en .env o el 5000 por defecto
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});