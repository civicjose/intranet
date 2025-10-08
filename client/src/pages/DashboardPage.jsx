import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('No se pudo obtener el perfil del usuario', error);
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Pantalla de carga mientras se obtienen los datos
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Cargando...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-macrosad-purple">
            Intranet Macrosad
          </h1>
          <button
            onClick={handleLogout}
            className="bg-macrosad-pink text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
          
          {/* --- LÓGICA CONDICIONAL --- */}
          {user && user.departments && user.departments.length > 0 ? (
            
            // --- VISTA 1: El usuario TIENE departamentos ---
            <div className="bg-white shadow-sm rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800">
                ¡Bienvenido, {user.first_name}!
              </h2>
              <p className="text-gray-600 mt-2">
                Aquí se mostrarán tus herramientas y accesos directos.
              </p>
              {/* Aquí irá el futuro contenido del dashboard, como la lista de herramientas */}
            </div>

          ) : (
            
            // --- VISTA 2: El usuario NO TIENE departamentos ---
            <div className="text-center bg-white shadow-sm rounded-lg p-12">
              <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Pendiente de Asignación
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Tu cuenta ha sido creada correctamente, pero aún no tienes herramientas asignadas.
              </p>
              <div className="mt-6">
                <p className="text-sm font-semibold text-macrosad-purple">
                  Por favor, comunícate con tu responsable o con el administrador del sistema para que te asignen tus departamentos.
                </p>
              </div>
            </div>

          )}

        </div>
      </main>
    </div>
  );
}

export default DashboardPage;