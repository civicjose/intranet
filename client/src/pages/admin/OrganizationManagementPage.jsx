// client/src/pages/admin/OrganizationManagementPage.jsx
import React, { useState } from 'react';
import { MdCorporateFare, MdBusiness, MdTerrain, MdWork, MdLocationOn } from 'react-icons/md';

import DepartmentManagement from './organization/DepartmentManagement';
import AreaManagement from './organization/AreaManagement';
import TerritoryManagement from './organization/TerritoryManagement';
import PositionManagement from './organization/PositionManagement';
import LocationManagement from './organization/LocationManagement';

const TABS = [
  { name: 'Departamentos', icon: <MdBusiness /> },
  { name: 'Áreas', icon: <MdCorporateFare /> },
  { name: 'Territorios', icon: <MdTerrain /> },
  { name: 'Puestos', icon: <MdWork /> },
  { name: 'Ubicaciones', icon: <MdLocationOn /> }
];

const OrganizationManagementPage = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].name);

  const renderContent = () => {
    switch (activeTab) {
      case 'Departamentos': return <DepartmentManagement />;
      case 'Áreas': return <AreaManagement />;
      case 'Territorios': return <TerritoryManagement />;
      case 'Puestos': return <PositionManagement />;
      case 'Ubicaciones': return <LocationManagement />;
      default: return null;
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Organización</h1>
        <p className="text-gray-500 mt-1">Gestiona la estructura organizativa interna de la empresa.</p>
      </header>
      
      <div className="bg-light-card shadow-md rounded-lg">
        {/* Contenedor de Pestañas con nuevo diseño */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm outline-none transition-all duration-200 ${
                  activeTab === tab.name
                    ? 'border-macrosad-pink text-macrosad-pink'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Contenedor del contenido con padding */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagementPage;