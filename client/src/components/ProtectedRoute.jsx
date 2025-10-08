import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si no hay token, redirigimos a la página de login
    return <Navigate to="/" />;
  }

  // Si hay un token, mostramos el componente hijo (el Dashboard)
  return children;
}

export default ProtectedRoute;