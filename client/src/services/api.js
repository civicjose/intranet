import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de Petición (request) - Se queda igual
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPUESTA (response) ---
// Aquí está la nueva lógica
apiClient.interceptors.response.use(
  (response) => {
    // Buscamos la cabecera con nuestro token refrescado
    const newToken = response.headers['x-refreshed-token'];
    if (newToken) {
      console.log('Token de sesión renovado.');
      localStorage.setItem('token', newToken); // Actualizamos el token
    }
    return response;
  },
  (error) => {
    // Si recibimos un 401 (No Autorizado), es una señal de que la sesión ha expirado
    if (error.response && error.response.status === 401) {
      console.log('Sesión expirada por el servidor. Cerrando sesión.');
      localStorage.removeItem('token');
      // Recargamos la página en la ruta raíz para forzar la ida al login
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;