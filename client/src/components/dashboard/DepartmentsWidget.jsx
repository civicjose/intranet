// client/src/components/dashboard/DepartmentsWidget.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { MdBusiness } from 'react-icons/md';

const DepartmentsWidget = () => {
  const { user } = useAuth();
  const [allDepartments, setAllDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargamos la lista completa de departamentos una sola vez
  useEffect(() => {
    apiClient.get('/departments')
      .then(res => {
        setAllDepartments(res.data);
      })
      .catch(err => {
        console.error("Error al cargar la lista de departamentos:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Usamos useMemo para calcular los departamentos a mostrar de forma eficiente
  const departmentsToShow = useMemo(() => {
    // Caso 1: El usuario tiene departamentos asignados directamente.
    if (user.departments && user.departments.length > 0) {
      return user.departments;
    }
    
    // Caso 2: El usuario no tiene deptos directos, pero sí un área.
    if (user.area_id) {
      // Filtramos la lista completa para encontrar los departamentos de su área.
      return allDepartments.filter(dept => dept.area_id === user.area_id);
    }

    // Caso 3: El usuario no tiene ni departamentos ni área.
    return [];
  }, [user, allDepartments]);

  // Determinamos el título del widget según el caso
  const widgetTitle = (user.departments && user.departments.length > 0) 
    ? 'Mis Departamentos' 
    : (user.area_name ? `Departamentos de ${user.area_name}` : 'Departamentos');

  if (loading) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
        </div>
    );
  }

  // Si después de toda la lógica no hay departamentos que mostrar, no renderizamos el widget.
  if (departmentsToShow.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-bold text-gray-800 text-lg mb-3">{widgetTitle}</h3>
      <ul className="space-y-2">
        {departmentsToShow.map((dept) => (
          <li key={dept.id} className="flex items-center text-gray-600">
            <MdBusiness className="mr-3 text-macrosad-pink" />
            <span>{dept.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DepartmentsWidget;