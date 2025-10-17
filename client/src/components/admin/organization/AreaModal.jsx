// client/src/components/admin/organization/AreaModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../../ErrorMessage';

const AreaModal = ({ area, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!area;

  useEffect(() => {
    if (isEditing) {
      setName(area.name);
    }
  }, [area, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onSave({ id: area?.id, name });
    } catch (err) {
      setError(err.response?.data?.message || 'Ha ocurrido un error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Editar Área' : 'Añadir Nueva Área'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Área</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              autoFocus
            />
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

export default AreaModal;