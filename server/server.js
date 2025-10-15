require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- INICIALIZACIÓN DE LA APP ---
const app = express();

// --- MIDDLEWARES GENERALES ---
app.use(cors());

// Aumentamos el límite del tamaño del payload para aceptar contenido enriquecido de las noticias
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Hacemos que la carpeta 'uploads' sea accesible públicamente para servir imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- RUTAS DE LA API ---
app.get('/', (req, res) => {
    res.json({ message: 'API de Intranet Macrosad funcionando correctamente!' });
});

// Importación de todas las rutas
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const newsRoutes = require('./routes/newsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Registro de las rutas en la aplicación
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);


// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});