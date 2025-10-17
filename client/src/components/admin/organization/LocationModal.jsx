// client/src/components/admin/organization/LocationModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../../ErrorMessage';

const LocationModal = ({ location, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    type: 'centro'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!location;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        province: location.province || '',
        postal_code: location.postal_code || '',
        type: location.type || 'centro'
      });
    }
  }, [location, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onSave({ id: location?.id, ...formData });
    } catch (err) {
      setError(err.response?.data?.message || 'Ha ocurrido un error al guardar la ubicación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Editar Ubicación' : 'Nueva Ubicación'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required autoFocus />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md">
                <option value="centro">Centro</option>
                <option value="sede">Sede</option>
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Provincia</label>
                <input type="text" name="province" value={formData.province} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
            </div>
            
            {error && <div className="md:col-span-2"><ErrorMessage message={error} /></div>}
          </div>
          <footer className="flex justify-end p-5 border-t bg-gray-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="bg-white border border-gray-300 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:opacity-50">
              {isLoading && <FaSpinner className="animate-spin mr-2" />}Guardar
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;