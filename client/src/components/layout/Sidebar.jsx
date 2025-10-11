// client/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdOutlineDashboard, MdOutlineAdminPanelSettings, MdOutlineApps } from 'react-icons/md';

const Sidebar = () => {
  const { user } = useAuth();

  const linkClasses = "flex items-center px-4 py-3 text-gray-200 hover:bg-macrosad-pink hover:text-white transition-colors duration-200 rounded-md";
  const activeLinkClasses = "bg-macrosad-pink text-white";

  return (
    <div className="w-64 bg-macrosad-purple text-white flex flex-col p-4">
      <div className="text-center py-4 mb-4 border-b border-gray-500">
        <h1 className="text-2xl font-bold">Intranet</h1>
        <span className="text-sm">Macrosad</span>
      </div>
      <nav className="flex-grow space-y-2">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
          <MdOutlineDashboard className="mr-3" size={22} />
          Inicio
        </NavLink>
        <NavLink 
          to="/tools" // Ruta de ejemplo para el futuro
          className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
          <MdOutlineApps className="mr-3" size={22} />
          Herramientas
        </NavLink>

        {/* --- Sección solo para Administradores --- */}
        {user && user.role_id == 1 && (
          <div className="pt-4 mt-4 border-t border-gray-500">
            <p className="px-4 text-xs text-gray-400 uppercase mb-2">Administración</p>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <MdOutlineAdminPanelSettings className="mr-3" size={22} />
              Panel Principal
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;