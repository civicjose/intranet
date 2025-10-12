// client/src/components/admin/ReportModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../ErrorMessage';

const ReportModal = ({ report, allUsers, onSave, onClose }) => {
  const [formData, setFormData] = useState({ title: '', description: '', powerbi_url: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!report;

  useEffect(() => {
    if (isEditing) {
      setFormData({ title: report.title, description: report.description, powerbi_url: report.powerbi_url });
      setSelectedUsers(report.assigned_users?.map(u => u.id) || []);
    }
  }, [report, isEditing]);

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const payload = { ...formData, assigned_users: selectedUsers };
      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Ha ocurrido un error.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b"><h2 className="text-xl font-bold">{isEditing ? 'Editar Informe' : 'Nuevo Informe'}</h2><button onClick={onClose}><MdClose size={24} /></button></header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div><label className="block text-sm font-medium">Título</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required /></div>
            <div><label className="block text-sm font-medium">Descripción</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="2" className="mt-1 w-full p-2 border rounded-md"></textarea></div>
            <div><label className="block text-sm font-medium">URL de Power BI</label><input type="url" value={formData.powerbi_url} onChange={e => setFormData({...formData, powerbi_url: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required /></div>
            <div>
              <label className="block text-sm font-medium">Asignar Permisos a Usuarios</label>
              <input type="search" placeholder="Buscar usuario..." onChange={e => setSearchTerm(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
              <div className="mt-2 bg-gray-50 p-3 rounded-md border max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <label key={user.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-200 cursor-pointer">
                      <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleUserToggle(user.id)} className="rounded text-macrosad-pink" />
                      <span>{user.first_name} {user.last_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {error && <ErrorMessage message={error} />}
          </div>
          <footer className="flex justify-end p-5 border-t bg-gray-50"><button type="button" onClick={onClose} className="bg-white border font-bold py-2 px-4 rounded-lg mr-2">Cancelar</button><button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg flex items-center">{isLoading && <FaSpinner className="animate-spin mr-2" />}Guardar</button></footer>
        </form>
      </div>
    </div>
  );
};
export default ReportModal;