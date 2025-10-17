require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- INICIALIZACIÓN DE LA APP ---
const app = express();

// --- MIDDLEWARES GENERALES ---
// Usamos la configuración simple de CORS, ya que no necesitamos exponer cabeceras personalizadas.
app.use(cors()); 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- RUTAS DE LA API ---
// El servidor primero intentará hacer match con todas las rutas de la API.
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/areas', require('./routes/areaRoutes'));
app.use('/api/territories', require('./routes/territoryRoutes'));
app.use('/api/positions', require('./routes/positionRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));



// --- CONFIGURACIÓN PARA DESPLIEGUE EN PRODUCCIÓN ---

// 1. Servir los archivos estáticos de la carpeta 'uploads'.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Servir la aplicación de React construida (desde la carpeta 'dist' del cliente).
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// 3. Redirigir todas las demás peticiones (que no sean de la API) al index.html de React.
// Esto es crucial para que el enrutamiento del frontend (React Router) funcione correctamente.
app.get(/^\/((?!api).)*$/, (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
});


// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});