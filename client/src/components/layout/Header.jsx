// client/src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MdOutlinePerson, 
  MdOutlineLogout, 
  MdMenu, 
  MdOutlineNotifications, // Icono de la campana
  MdArticle,              // Iconos para las notificaciones de ejemplo
  MdOutlineEvent, 
  MdOutlineSupportAgent 
} from 'react-icons/md';
import ProfileModal from '../profile/ProfileModal';
import apiClient from '../../services/api';

// --- NUEVO: Componente para el panel de notificaciones ---
const NotificationsDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null);

  // Cierra el dropdown si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const demoNotifications = [
    { id: 1, icon: <MdArticle className="text-blue-500" />, title: "Nueva noticia publicada", description: "Revisa los últimos resultados trimestrales.", time: "hace 5m" },
    { id: 2, icon: <MdOutlineEvent className="text-green-500" />, title: "Evento: Reunión General", description: "Mañana a las 10:00 en la sala principal.", time: "hace 2h" },
    { id: 3, icon: <MdOutlineSupportAgent className="text-red-500" />, title: "Ticket #1234 resuelto", description: "Tu incidencia con la impresora ha sido cerrada.", time: "hace 1d" },
  ];

  return (
    <div ref={dropdownRef} className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b">
        <h3 className="font-bold text-gray-800">Notificaciones</h3>
      </div>
      <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {demoNotifications.map(notif => (
          <li key={notif.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex-shrink-0 mt-1">{notif.icon}</div>
            <div className="flex-grow">
              <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
              <p className="text-sm text-gray-500">{notif.description}</p>
              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="p-2 text-center border-t">
        <a href="#" className="text-sm font-semibold text-macrosad-pink hover:underline">Ver todas</a>
      </div>
    </div>
  );
};


const Header = ({ onMenuClick }) => { 
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // --- NUEVO: Estado para el panel de notificaciones ---
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  const getAvatarUrl = (path) => {
    if (!path) return null;
    return `${apiClient.defaults.baseURL.replace('/api', '')}${path}`;
  };

  const avatarSrc = getAvatarUrl(user?.avatar_url);

  return (
    <>
      <header className="bg-white shadow-sm p-4 flex justify-between items-center relative">
        {/* Lado Izquierdo: Botón de menú para móvil */}
        <div>
          <button 
            onClick={onMenuClick} 
            className="text-gray-500 md:hidden"
          >
            <MdMenu size={28} />
          </button>
        </div>

        {/* Lado Derecho: Iconos y menú de usuario */}
        <div className="flex items-center gap-2">
          
          {/* --- NUEVO: Botón de la campana de notificaciones --- */}
          <button 
            onClick={() => setNotificationsOpen(prev => !prev)} 
            className="relative p-2 text-gray-500 hover:text-macrosad-pink hover:bg-red-50 rounded-full transition-colors"
            title="Notificaciones"
          >
            <MdOutlineNotifications size={24} />
            {/* Punto rojo para indicar notificaciones nuevas (demo) */}
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Menú de Usuario */}
          <button 
            onClick={() => setIsProfileModalOpen(true)} 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <MdOutlinePerson size={24} className="text-gray-500" />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-sm text-gray-700">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </button>
          
          {/* Botón de Logout */}
          <button 
            onClick={logout} 
            className="p-2 text-gray-500 hover:text-macrosad-pink hover:bg-red-50 rounded-full transition-colors"
            title="Cerrar Sesión"
          >
            <MdOutlineLogout size={24} />
          </button>
        </div>

        {/* --- NUEVO: Renderizado condicional del panel --- */}
        {isNotificationsOpen && <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />}
      </header>

      {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
    </>
  );
};

export default Header;