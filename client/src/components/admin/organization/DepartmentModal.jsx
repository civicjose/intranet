// client/src/components/admin/organization/DepartmentModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../../ErrorMessage';

const DepartmentModal = ({ department, areas, onSave, onClose }) => {
  const [formData, setFormData] = useState({ name: '', area_id: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!department;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: department.name || '',
        area_id: department.area_id || ''
      });
    }
  }, [department, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onSave({ id: department?.id, ...formData });
    } catch (err) {
      setError(err.response?.data?.message || 'Ha ocurrido un error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Editar Departamento' : 'Añadir Nuevo Departamento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Departamento</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required autoFocus />
            </div>
            <div>
              <label htmlFor="area_id" className="block text-sm font-medium text-gray-700 mb-1">Área a la que pertenece</label>
              <select name="area_id" id="area_id" value={formData.area_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">-- Sin área asignada --</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
            {error && <div className="mt-2"><ErrorMessage message={error} /></div>}
          </div>
          <footer className="flex justify-end p-5 border-t bg-gray-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="bg-white border border-gray-300 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:opacity-50">
              {isLoading && <FaSpinner className="animate-spin mr-2" />}
              Guardar
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;