// client/src/context/AuthContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback
} from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // La función de logout ahora es más simple: solo limpia el estado y el token.
  // La navegación se gestiona de forma declarativa en App.jsx
  const logout = useCallback(() => {
    console.log("Cerrando sesión y limpiando estado.");
    localStorage.removeItem('token');
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error("Token inválido o expirado.");
        logout(); // Si el token es inválido, simplemente llamamos a logout.
      }
    }
    setIsLoading(false);
  }, [logout]);

  // Se ejecuta solo una vez para configurar el oyente de eventos global.
  useEffect(() => {
    // Al cargar la app, intentamos obtener el usuario si hay un token
    fetchUser();
    
    // Escuchamos el evento global 'logout-event' que puede ser disparado desde cualquier lugar.
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('logout-event', handleLogoutEvent);

    // Limpiamos el listener cuando el componente se desmonte para evitar fugas de memoria.
    return () => {
      window.removeEventListener('logout-event', handleLogoutEvent);
    };
  }, [fetchUser, logout]);

  // La función de login ahora también configura la cabecera por defecto de apiClient.
  const login = useCallback(async (token) => {
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    setUser,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto (sin cambios)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};