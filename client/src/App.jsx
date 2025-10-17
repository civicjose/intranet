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
import ReportsPage from './pages/ReportsPage';
import CalendarPage from './pages/CalendarPage';
import TicketsPage from './pages/TicketsPage';
import ResourcesPage from './pages/ResourcesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import NewsManagementPage from './pages/admin/NewsManagementPage';
import NewsEditor from './pages/admin/NewsEditor';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import OrganizationManagementPage from './pages/admin/OrganizationManagementPage';

function App() {
  const { logout, isAuthenticated } = useAuth();

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
          {/* Rutas para todos los usuarios logueados */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/resources" element={<ResourcesPage />} /> 

          {/* Rutas de Administración anidadas */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/news" element={<NewsManagementPage />} />
          <Route path="/admin/news/new" element={<NewsEditor />} />
          <Route path="/admin/news/edit/:id" element={<NewsEditor />} />
          <Route path="/admin/news/categories" element={<CategoryManagementPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/organization" element={<OrganizationManagementPage />} />
        </Route>
      )}
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;