// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Importamos el hook

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth(); // 2. Usamos el estado del contexto

  if (!isAuthenticated) {
    // Si no está autenticado, lo redirigimos al login
    return <Navigate to="/" />;
  }

  // Si lo está, mostramos el componente que protege
  return children;
}

export default ProtectedRoute;