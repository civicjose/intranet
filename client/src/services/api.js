import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de Petición (request)
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

// Interceptor de Respuesta (response)
apiClient.interceptors.response.use(
  (response) => {
    // La lógica de renovación de token se ha eliminado.
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Sesión expirada por el servidor. Cerrando sesión.');
      localStorage.removeItem('token');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;