// client/src/components/admin/organization/AreaModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../../ErrorMessage';

const AreaModal = ({ area, divisions, onSave, onClose }) => {
  const [formData, setFormData] = useState({ name: '', division_id: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!area;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: area.name || '',
        division_id: area.division_id || '',
      });
    }
  }, [area, isEditing]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onSave({ id: area?.id, ...formData });
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
          <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Editar Área' : 'Nueva Área'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Área</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label htmlFor="division_id" className="block text-sm font-medium text-gray-700 mb-1">División</label>
              <select name="division_id" id="division_id" value={formData.division_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">-- Sin división --</option>
                {divisions.map(div => (<option key={div.id} value={div.id}>{div.name}</option>))}
              </select>
            </div>
            {error && <ErrorMessage message={error} />}
          </div>
          <footer className="flex justify-end p-5 border-t bg-gray-50">
            <button type="button" onClick={onClose} className="bg-white border font-bold py-2 px-4 rounded-lg mr-2">Cancelar</button>
            <button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg flex items-center">
              {isLoading && <FaSpinner className="animate-spin mr-2" />}Guardar
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AreaModal;