// client/src/pages/admin/AdminDashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MdGroup, MdBusiness, MdAdminPanelSettings, MdArticle } from 'react-icons/md';

const AdminDashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Secciones de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Link 
          to="/admin/users" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-200 border-l-4 border-macrosad-pink"
        >
          <div className="flex items-center">
            <MdGroup className="text-4xl text-macrosad-pink mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Usuarios</h2>
              <p className="text-gray-600 mt-1">Gestionar cuentas, roles y departamentos.</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/departments" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-200 border-l-4 border-macrosad-pink"
        >
          <div className="flex items-center">
            <MdBusiness className="text-4xl text-macrosad-pink mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Departamentos</h2>
              <p className="text-gray-600 mt-1">Crear, editar o eliminar departamentos.</p>
            </div>
          </div>
        </Link>
        
        {/* --- NUEVA TARJETA PARA NOTICIAS --- */}
        <Link 
          to="/admin/news" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-200 border-l-4 border-macrosad-pink"
        >
          <div className="flex items-center">
            <MdArticle className="text-4xl text-macrosad-pink mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Noticias</h2>
              <p className="text-gray-600 mt-1">Crear y publicar comunicados.</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-300 cursor-not-allowed opacity-60">
          <div className="flex items-center">
            <MdAdminPanelSettings className="text-4xl text-gray-400 mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Roles</h2>
              <p className="text-gray-600 mt-1">Definir permisos para cada rol.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;