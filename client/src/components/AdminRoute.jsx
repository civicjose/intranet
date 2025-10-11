// client/src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // 1. Importa Outlet
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user.role_id != 1) {
    return <Navigate to="/dashboard" />;
  }

  // 2. Outlet renderizará la ruta hija que coincida (AdminDashboardPage o UserManagementPage)
  return <Outlet />; 
};

export default AdminRoute;