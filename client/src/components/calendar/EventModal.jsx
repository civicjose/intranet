// client/src/components/calendar/EventModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose, MdEdit, MdDelete } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../ErrorMessage';

const EventModal = ({ eventInfo, onSave, onClose, onDelete, isAdmin }) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isCreating = !eventInfo?.id;

  useEffect(() => {
    if (eventInfo) {
      setFormData({
        title: eventInfo.title || '',
        start_date: eventInfo.start ? eventInfo.start.split('T')[0] : '',
        end_date: eventInfo.end ? eventInfo.end.split('T')[0] : '',
        all_day: eventInfo.allDay !== undefined ? eventInfo.allDay : true,
        description: eventInfo.description || ''
      });
    }
    if (isCreating) {
      setIsEditing(true);
    }
  }, [eventInfo, isCreating]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const payload = { ...formData, end_date: formData.all_day ? null : formData.end_date };
      await onSave(payload, eventInfo?.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el evento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => setIsEditing(true);
  const handleCancelClick = () => {
    if (isCreating) {
      onClose();
    } else {
      setIsEditing(false);
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">
            {isCreating ? 'Crear Evento' : (isEditing ? 'Editar Evento' : 'Detalles del Evento')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input type="text" name="title" value={formData.title || ''} onChange={handleChange} readOnly={!isEditing} required className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} readOnly={!isEditing} required className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" />
              </div>
              <div className="flex items-center pt-6">
                <input type="checkbox" id="all_day" name="all_day" checked={formData.all_day} onChange={handleChange} disabled={!isEditing} className="h-4 w-4 rounded text-macrosad-pink focus:ring-macrosad-pink" />
                <label htmlFor="all_day" className="ml-2 block text-sm text-gray-900">Todo el día</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea name="description" rows="3" value={formData.description || ''} onChange={handleChange} readOnly={!isEditing} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100"></textarea>
            </div>
            {error && <div className="mt-2"><ErrorMessage message={error} /></div>}
          </div>

          <footer className="flex justify-between items-center p-5 border-t bg-gray-50 rounded-b-lg">
            <div>
              {!isCreating && isAdmin && !isEditing && (
                <div className="flex items-center gap-2">
                  {/* --- BOTÓN EDITAR (ESTILO CORREGIDO) --- */}
                  <button type="button" onClick={handleEditClick} className="bg-macrosad-purple text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex items-center"><MdEdit className="mr-2" />Editar</button>
                  {/* --- BOTÓN BORRAR (ESTILO CORREGIDO) --- */}
                  <button type="button" onClick={() => onDelete(eventInfo)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center"><MdDelete className="mr-2" />Borrar</button>
                </div>
              )}
            </div>
            {isEditing && (
              <div className="flex justify-end w-full">
                {/* --- BOTÓN CANCELAR (ESTILO CONSISTENTE) --- */}
                <button type="button" onClick={handleCancelClick} className="bg-white border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-100">Cancelar</button>
                {/* --- BOTÓN GUARDAR (ESTILO CONSISTENTE) --- */}
                <button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex items-center disabled:opacity-50">
                  {isLoading && <FaSpinner className="animate-spin mr-2" />}
                  Guardar
                </button>
              </div>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
};

export default EventModal;