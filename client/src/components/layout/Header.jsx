// client/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MdOutlinePerson, MdOutlineLogout, MdMenu } from 'react-icons/md';
import ProfileModal from '../profile/ProfileModal';
import apiClient from '../../services/api';

const Header = ({ onMenuClick }) => { 
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Función para construir la URL completa del avatar
  const getAvatarUrl = (path) => {
    if (!path) return null;
    return `${apiClient.defaults.baseURL.replace('/api', '')}${path}`;
  };

  const avatarSrc = getAvatarUrl(user?.avatar_url);

  return (
    <>
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        {/* Lado Izquierdo: Solo el botón de menú para móvil */}
        <div>
          <button 
            onClick={onMenuClick} 
            className="text-gray-500 md:hidden" // Oculto en pantallas de ordenador
          >
            <MdMenu size={28} />
          </button>
        </div>

        {/* Lado Derecho: Menú de Usuario */}
        <div className="flex items-center">
          <button 
            onClick={() => setIsProfileModalOpen(true)} 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {/* Muestra la imagen de perfil si existe, si no, un icono */}
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
          <button 
            onClick={logout} 
            className="ml-2 p-2 text-gray-500 hover:text-macrosad-pink hover:bg-red-50 rounded-full transition-colors"
            title="Cerrar Sesión"
          >
            <MdOutlineLogout size={24} />
          </button>
        </div>
      </header>

      {/* Renderiza el modal del perfil si está abierto */}
      {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
    </>
  );
};

export default Header;