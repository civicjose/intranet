// Importamos dotenv para usar las variables de entorno
require('dotenv').config();
const mysql = require('mysql2');

// Creamos un "pool" de conexiones
// Un pool es más eficiente que crear una conexión por cada consulta
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos la versión "promise" del pool para usar async/await
// Esto hace el código más limpio y fácil de leer
module.exports = pool.promise();