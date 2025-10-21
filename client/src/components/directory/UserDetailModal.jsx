// client/src/components/directory/UserDetailModal.jsx
import React from 'react';
import apiClient from '../../services/api';
import { MdClose, MdMail, MdPhone, MdBusiness, MdLocationOn, MdTerrain } from 'react-icons/md';

// Componente de fila de información rediseñado para mayor impacto visual
const InfoRow = ({ icon, label, value, isLink = false }) => {
  if (!value) return null;
  return (
    <div className="flex items-start">
      <span className="text-macrosad-pink mt-1 mr-4 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-bold text-macrosad-purple uppercase tracking-wider">{label}</p>
        {isLink ? (
          <a href={isLink} className="text-gray-800 hover:underline break-all font-semibold text-base">{value}</a>
        ) : (
          <p className="text-gray-800 font-semibold text-base">{value}</p>
        )}
      </div>
    </div>
  );
};


const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  const getAvatarUrl = (path) => path ? `${apiClient.defaults.baseURL.replace('/api', '')}${path}` : null;
  const avatarSrc = getAvatarUrl(user.avatar_url);

  // Lógica para separar el título profesional en dos partes
  const getProfessionalTitleParts = () => {
    const { position_name, area_name, departments } = user;
    const title = {
        main: position_name || 'Puesto no asignado',
        sub: null
    };

    if (area_name) {
        title.sub = `Área de ${area_name}`;
    } else if (departments && departments.length > 0) {
        title.sub = departments.length === 1 
            ? `Departamento de ${departments[0].name}` 
            : 'Varios Departamentos';
    }
    
    if (!position_name && (area_name || departments?.length > 0)) {
        title.main = title.sub;
        title.sub = null;
    }

    return title;
  };

  const professionalTitle = getProfessionalTitleParts();
  const showExtraOrgInfo = user.departments && user.departments.length > 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="w-full md:w-1/3 bg-gradient-to-b from-macrosad-purple to-macrosad-pink p-8 flex flex-col items-center justify-center text-white">
            <img 
              src={avatarSrc || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=FFFFFF&color=6c3b5d&size=128&bold=true`} 
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <h3 className="text-2xl font-bold mt-4 text-center">{user.first_name} {user.last_name}</h3>
        </div>

        <div className="w-full md:w-2/3">
          <header className="flex justify-between items-center p-5 border-b">
            <h2 className="text-xl font-bold text-gray-800">Información Profesional</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
          </header>
          
          <div className="p-8 space-y-8">
            {/* Título profesional */}
            <div>
              <p className="text-xl font-bold text-gray-800">{professionalTitle.main}</p>
              {professionalTitle.sub && (
                  <p className="text-md text-gray-500 font-medium">{professionalTitle.sub}</p>
              )}
            </div>

            {/* Información adicional */}
            <div className="space-y-5">
                <InfoRow icon={<MdMail size={22} />} label="Email" value={user.email} isLink={`mailto:${user.email}`} />
                <InfoRow icon={<MdPhone size={22} />} label="Teléfono" value={user.company_phone} />
                <InfoRow icon={<MdLocationOn size={22} />} label="Ubicación" value={user.location_name} />
                <InfoRow icon={<MdTerrain size={22} />} label="Territorio" value={user.territory_name} />
                {showExtraOrgInfo && (
                    <InfoRow icon={<MdBusiness size={22} />} label="Otros Departamentos" value={user.departments.map(d => d.name).join(', ')} />
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;