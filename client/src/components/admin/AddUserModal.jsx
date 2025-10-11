// client/src/components/admin/AddUserModal.jsx
import React, { useState } from 'react';
import apiClient from '../../services/api';
import ErrorMessage from '../ErrorMessage';
import { MdClose, MdPerson, MdMail } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';

const FormInput = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
    <input {...props} className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-macrosad-pink focus:border-macrosad-pink" />
  </div>
);

const AddUserModal = ({ roles, departments: allDepartments, onSaveSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role_id: roles.length > 0 ? roles.find(r => r.name === 'Usuario')?.id || roles[0].id : '',
    departments: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (departmentId) => {
    setFormData(prev => {
      const currentDepartments = prev.departments;
      return {
        ...prev,
        departments: currentDepartments.includes(departmentId)
          ? currentDepartments.filter(id => id !== departmentId)
          : [...currentDepartments, departmentId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const dataToSave = { ...formData, role_id: Number(formData.role_id) };
      await apiClient.post('/users', dataToSave);
      onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el usuario. Por favor, revisa los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Añadir Nuevo Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors"><MdClose size={24} /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <FormInput icon={<MdPerson className="text-gray-400"/>} type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                <FormInput icon={<MdPerson className="text-gray-400"/>} type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
              <FormInput icon={<MdMail className="text-gray-400"/>} type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">Rol Inicial</label>
              <select name="role_id" id="role_id" value={formData.role_id} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-macrosad-pink focus:border-macrosad-pink">
                {roles.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Departamentos</label>
              <div className="mt-2 bg-gray-50 p-3 rounded-md border max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {allDepartments.map(dept => (
                          <label key={dept.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-200 cursor-pointer">
                              <input type="checkbox" checked={formData.departments.includes(dept.id)} onChange={() => handleDepartmentChange(dept.id)} className="rounded text-macrosad-pink focus:ring-macrosad-pink" />
                              <span className="text-sm text-gray-700 select-none">{dept.name}</span>
                          </label>
                      ))}
                  </div>
              </div>
            </div>

            {error && <ErrorMessage message={error} />}
          </div>

          <footer className="flex justify-end p-5 border-t bg-gray-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="bg-white border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex items-center disabled:opacity-50">
              {isLoading && <FaSpinner className="animate-spin mr-2" />}
              {isLoading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;