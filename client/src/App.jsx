import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import VerificationPage from './pages/VerificationPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';

function App() {
  const navigate = useNavigate();

  // Función de logout que se pasará al hook de inactividad
  const handleLogout = () => {
    localStorage.removeItem('token');
    // Usamos navigate para una redirección más limpia dentro de la app de React
    navigate('/');
  };

  // Usamos el hook con un timeout de 10 minutos (600000 ms)
  // que llamará a handleLogout si hay inactividad.
  useInactivityTimeout(handleLogout, 600000);

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/verify" element={<VerificationPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />

      {/* Ruta Protegida */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;