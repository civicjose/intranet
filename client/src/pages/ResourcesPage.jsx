// client/src/pages/ResourcesPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MdOutlineWeb, 
  MdOutlineSchool, 
  MdOutlineContacts, 
  MdOutlineBeachAccess, 
  MdOutlineTrendingUp, 
  MdOutlineCode, 
  MdOutlineBook, 
  MdOutlineAttachMoney 
} from 'react-icons/md';

// Datos de ejemplo para la demo
const allResources = {
  // Recursos visibles para todos los usuarios
  generic: [
    { title: 'Portal del Empleado', description: 'Accede a tus nóminas y datos personales.', url: '#', icon: <MdOutlineContacts size={24} className="text-white" /> },
    { title: 'Plataforma de Formación', description: 'Cursos y materiales para tu desarrollo.', url: '#', icon: <MdOutlineSchool size={24} className="text-white" /> },
    { title: 'Directorio de Empresa', description: 'Encuentra a tus compañeros.', url: '#', icon: <MdOutlineWeb size={24} className="text-white" /> },
  ],
  // Recursos específicos que se mostrarán según el departamento del usuario
  'Recursos Humanos': [
    { title: 'Gestión de Vacaciones', description: 'Solicita tus días libres y consulta tu calendario.', url: '#', icon: <MdOutlineBeachAccess size={24} className="text-white" /> },
    { title: 'Evaluación de Desempeño', description: 'Accede a los formularios y guías de evaluación.', url: '#', icon: <MdOutlineTrendingUp size={24} className="text-white" /> }
  ],
  'Tecnología': [
    { title: 'Repositorio de Proyectos', description: 'Acceso al Git de la compañía.', url: '#', icon: <MdOutlineCode size={24} className="text-white" /> },
    { title: 'Documentación de API', description: 'Guías de referencia para desarrolladores.', url: '#', icon: <MdOutlineBook size={24} className="text-white" /> }
  ],
  'Administración': [
    { title: 'Software de Contabilidad', description: 'Acceso a la plataforma de gestión contable.', url: '#', icon: <MdOutlineAttachMoney size={24} className="text-white" /> },
  ]
};

// Componente para renderizar una tarjeta de recurso individual
const ResourceCard = ({ title, description, url, icon }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="group flex items-center bg-white p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
    <div className="flex-shrink-0 w-12 h-12 bg-macrosad-pink rounded-lg flex items-center justify-center mr-4">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-gray-800 group-hover:text-macrosad-pink transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  </a>
);

// Componente para una sección de recursos (genérica o por departamento)
const ResourceSection = ({ title, resources }) => (
  <section>
    <h2 className="text-2xl font-bold text-gray-700 mb-4 border-l-4 border-macrosad-pink pl-3">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map(resource => (
        <ResourceCard key={resource.title} {...resource} />
      ))}
    </div>
  </section>
);


const ResourcesPage = () => {
  const { user } = useAuth();
  const userDepartments = user?.departments?.map(dept => dept.name) || [];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Recursos y Herramientas</h1>
        <p className="text-gray-500 mt-1">Enlaces directos a las herramientas que necesitas en tu día a día.</p>
      </header>

      {/* Sección de Herramientas Generales */}
      <ResourceSection title="Herramientas Generales" resources={allResources.generic} />

      {/* Secciones de Herramientas por Departamento */}
      {userDepartments.map(deptName => {
        const deptResources = allResources[deptName];
        if (deptResources && deptResources.length > 0) {
          return <ResourceSection key={deptName} title={`Herramientas de ${deptName}`} resources={deptResources} />;
        }
        return null;
      })}
    </div>
  );
};

export default ResourcesPage;