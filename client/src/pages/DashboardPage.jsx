// client/src/pages/DashboardPage.jsx
import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import NewsFeed from '../components/dashboard/NewsFeed';
import DepartmentsWidget from '../components/dashboard/DepartmentsWidget';
import CompactWeather from '../components/dashboard/CompactWeather';
import CompactClock from '../components/dashboard/CompactClock';

const DashboardPage = () => {
  // --- SE HA ELIMINADO LA COMPROBACIÓN PROBLEMÁTICA DE AQUÍ ---

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna principal de noticias */}
        <div className="lg:col-span-2">
          <NewsFeed />
        </div>

        {/* Columna lateral de widgets */}
        <aside className="space-y-8">
          {/* Cada widget ahora es responsable de su propia visibilidad */}
          <DepartmentsWidget />
        </aside>

      </div>
    </div>
  );
};

export default DashboardPage;