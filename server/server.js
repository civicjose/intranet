// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());

// --- CORRECCIÓN AQUÍ ---
// Aumentamos el límite del tamaño del payload que el servidor puede aceptar.
// '50mb' es un límite generoso para artículos con imágenes.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// --------------------

// Hacemos que la carpeta 'uploads' sea accesible públicamente
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- RUTAS ---
app.get('/', (req, res) => {
    res.json({ message: 'API de Intranet Macrosad funcionando correctamente!' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const departmentRoutes = require('./routes/departmentRoutes');
app.use('/api/departments', departmentRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const roleRoutes = require('./routes/roleRoutes');
app.use('/api/roles', roleRoutes);

const newsRoutes = require('./routes/newsRoutes');
app.use('/api/news', newsRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);


// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});