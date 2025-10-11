import React from 'react';
import { useAuth } from '../context/AuthContext';

// Importamos los componentes finales del dashboard
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NewsFeed from '../components/dashboard/NewsFeed';
import DepartmentsWidget from '../components/dashboard/DepartmentsWidget';

function DashboardPage() {
  const { user } = useAuth();

  // Vista para usuarios que aún no tienen departamentos asignados
  if (!user || !user.departments || user.departments.length === 0) {
    return (
      <div className="text-center bg-white shadow-md rounded-lg p-12">
        <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Pendiente de Asignación
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Tu cuenta ha sido creada correctamente, pero aún no tienes herramientas o noticias asignadas.
        </p>
        <div className="mt-6">
          <p className="text-sm font-semibold text-macrosad-purple">
            Por favor, comunícate con un administrador para que te asigne tus departamentos.
          </p>
        </div>
      </div>
    );
  }

  // El dashboard rediseñado con la cabecera unificada
  return (
    <div className="space-y-6">
      {/* 1. La nueva cabecera con el saludo y los widgets compactos */}
      <DashboardHeader />
      
      {/* 2. Grid principal con más protagonismo para las noticias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Columna principal para las noticias (ocupa 2/3 en pantallas grandes) */}
        <div className="lg:col-span-2">
          <NewsFeed />
        </div>

        {/* Columna lateral para otros widgets */}
        <div className="space-y-6">
          <DepartmentsWidget />
          {/* Aquí es donde podrías añadir futuros widgets como 'Enlaces Rápidos' */}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;