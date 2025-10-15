// client/src/components/tickets/CreateTicketModal.jsx
import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../ErrorMessage';
import apiClient from '../../services/api';

const CreateTicketModal = ({ onClose, onTicketCreated }) => {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('El título y el contenido son obligatorios.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await apiClient.post('/tickets', formData);
      onTicketCreated(); // Llama a la función para refrescar la lista
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear el ticket.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Ticket</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Asunto</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">Describe tu incidencia</label>
              <textarea name="content" id="content" rows="6" value={formData.content} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
            {error && <ErrorMessage message={error} />}
          </div>

          <footer className="flex justify-end p-5 border-t bg-gray-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="bg-white border border-gray-300 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:opacity-50">
              {isLoading && <FaSpinner className="animate-spin mr-2" />}
              Enviar Ticket
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;