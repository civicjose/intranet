// client/src/context/AuthContext.jsx
import React,
{
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback
} from 'react';
import apiClient from '../services/api';

// 1. Creamos el contexto
const AuthContext = createContext(null);

// 2. Creamos el proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Para saber si estamos verificando el token inicial

  // Función para verificar el token y obtener datos del usuario
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error("Token inválido o expirado. Cerrando sesión.");
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Al cargar la app, intentamos obtener el usuario si hay un token
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Función para iniciar sesión
  const login = (token) => {
    localStorage.setItem('token', token);
    // Volvemos a obtener los datos del usuario para actualizar el estado
    return fetchUser();
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Redirigimos al login
    window.location.href = '/';
  };

  // El valor que compartiremos con toda la app
  const value = {
    user,
    setUser,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user, // Un booleano útil para saber si está autenticado
  };

  // No renderizamos nada hasta que terminemos la carga inicial
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 3. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};