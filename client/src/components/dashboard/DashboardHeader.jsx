import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CompactClock from './CompactClock';
import CompactWeather from './CompactWeather';

const DashboardHeader = () => {
  const { user } = useAuth();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    // --- CORRECCIÓN: Aplicamos el degradado corporativo ---
    <div className="bg-gradient-to-r from-macrosad-purple to-macrosad-pink p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
      
      <div>
        <h2 className="text-2xl font-bold">¡{getGreeting()}, {user?.first_name}!</h2>
        <p className="text-purple-100 opacity-90">Aquí tienes un resumen de las últimas novedades.</p>
      </div>
      
      {/* Widgets Compactos (con fondo semitransparente y texto claro) */}
      <div className="flex items-center gap-4 sm:gap-6 bg-black/20 p-3 rounded-lg">
        <CompactClock />
        <div className="h-6 w-px bg-white/30"></div> {/* Separador vertical claro */}
        <CompactWeather />
      </div>
    </div>
  );
};

export default DashboardHeader;