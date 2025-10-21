// client/src/pages/admin/OrganizationManagementPage.jsx
import React, { useState } from 'react';
import { MdCorporateFare, MdBusiness, MdTerrain, MdWork, MdLocationOn, MdSplitscreen } from 'react-icons/md';

// Importamos todos los componentes de gestión
import DivisionManagement from './organization/DivisionManagement';
import DepartmentManagement from './organization/DepartmentManagement';
import AreaManagement from './organization/AreaManagement';
import TerritoryManagement from './organization/TerritoryManagement';
import PositionManagement from './organization/PositionManagement';
import LocationManagement from './organization/LocationManagement';

// Definimos las pestañas en el orden solicitado
const TABS = [
  { name: 'Divisiones', icon: <MdSplitscreen /> },
  { name: 'Áreas', icon: <MdCorporateFare /> },
  { name: 'Departamentos', icon: <MdBusiness /> },
  { name: 'Territorios', icon: <MdTerrain /> },
  { name: 'Ubicaciones', icon: <MdLocationOn /> },
  { name: 'Puestos', icon: <MdWork /> }
];

const OrganizationManagementPage = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].name);

  const renderContent = () => {
    switch (activeTab) {
      case 'Divisiones': return <DivisionManagement />;
      case 'Áreas': return <AreaManagement />;
      case 'Departamentos': return <DepartmentManagement />;
      case 'Territorios': return <TerritoryManagement />;
      case 'Ubicaciones': return <LocationManagement />;
      case 'Puestos': return <PositionManagement />;
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
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
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
        
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagementPage;