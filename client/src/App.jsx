// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';

// Layouts & Components
import AppLayout from './components/layout/AppLayout';
import AdminRoute from './components/AdminRoute';

// Pages
import LoginPage from './pages/LoginPage';
import VerificationPage from './pages/VerificationPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import NewsManagementPage from './pages/admin/NewsManagementPage';
import NewsEditor from './pages/admin/NewsEditor';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';

function App() {
  const { logout, isAuthenticated } = useAuth();

  // --- CORRECCIÓN AQUÍ ---
  // El hook se llama siempre, pero le pasamos 'isAuthenticated'
  // para que solo se active cuando el usuario está logueado.
  useInactivityTimeout(logout, 900000, isAuthenticated);

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/verify" element={!isAuthenticated ? <VerificationPage /> : <Navigate to="/dashboard" />} />
      <Route path="/complete-profile" element={!isAuthenticated ? <CompleteProfilePage /> : <Navigate to="/dashboard" />} />

      {/* Rutas Protegidas */}
      {isAuthenticated && (
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/departments" element={<DepartmentManagementPage />} />
          <Route path="/admin/news" element={<NewsManagementPage />} />
          <Route path="/admin/news/new" element={<NewsEditor />} />
          <Route path="/admin/news/edit/:id" element={<NewsEditor />} />
          <Route path="/admin/news/categories" element={<CategoryManagementPage />} />
        </Route>
      )}
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;