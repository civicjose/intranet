// client/src/components/dashboard/DepartmentsWidget.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MdBusiness } from 'react-icons/md';

const DepartmentsWidget = () => {
  const { user } = useAuth();

  // Si por alguna razón el usuario no tiene departamentos, no mostramos nada.
  if (!user?.departments || user.departments.length === 0) {
    return null;
  }

  return (
    <div className="bg-light-card p-6 rounded-xl shadow-lg h-full">
      <h3 className="font-bold text-xl text-text-dark mb-4">Mis Departamentos</h3>
      <div className="space-y-3">
        {user.departments.map((dept) => (
          <div key={dept.id} className="bg-light-bg p-3 rounded-lg flex items-center">
            <div className="bg-macrosad-pink/20 text-macrosad-pink p-2 rounded-full mr-4">
              <MdBusiness size={20} />
            </div>
            <span className="font-semibold text-text-dark">{dept.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentsWidget;