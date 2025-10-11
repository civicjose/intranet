import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { MdClose, MdEdit, MdPerson, MdPhone, MdCalendarToday, MdMail, MdCameraAlt, MdWork } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../ErrorMessage';

const ProfileModal = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const getAvatarUrl = (path) => path ? `${apiClient.defaults.baseURL.replace('/api', '')}${path}` : null;

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        companyPhone: user.company_phone || '',
        birthDate: user.birth_date ? user.birth_date.split('T')[0] : '',
      });
      setImagePreview(getAvatarUrl(user.avatar_url));
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- ESTA ES LA FUNCIÓN QUE FALTABA ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // ------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      let newAvatarUrl = user.avatar_url;
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('avatar', profileImage);
        const { data } = await apiClient.post('/users/me/avatar', imageFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
        newAvatarUrl = data.avatarUrl;
      }
      
      await apiClient.put('/users/me', formData);
      
      setUser(prevUser => ({
        ...prevUser,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_phone: formData.companyPhone,
        birth_date: formData.birthDate,
        avatar_url: newAvatarUrl,
      }));

      setSuccess('¡Perfil actualizado con éxito!');
      setTimeout(() => setSuccess(''), 3000);
      setIsEditing(false);
      setProfileImage(null);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="w-1/3 bg-gradient-to-b from-macrosad-purple to-purple-800 p-8 flex flex-col items-center justify-center text-white">
          <div className="relative">
            <img 
              src={imagePreview || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=FFFFFF&color=6c3b5d&size=128&bold=true`} 
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isEditing && (
              <button type="button" onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-macrosad-pink text-white p-2 rounded-full hover:bg-opacity-90 transition-transform hover:scale-110">
                <MdCameraAlt />
              </button>
            )}
          </div>
          <h3 className="text-2xl font-bold mt-4 text-center">{user.first_name} {user.last_name}</h3>
          <p className="text-sm text-purple-200 mt-1 flex items-center"><MdWork className="mr-2"/>{user.role_name}</p>
          
          {!isEditing && (
            <button type="button" onClick={() => setIsEditing(true)} className="mt-6 bg-white/20 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-white/30 flex items-center transition-colors">
              <MdEdit className="mr-2" /> Editar Perfil
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg" />
        </div>

        <div className="w-2/3">
          <header className="flex justify-between items-center p-5 border-b">
            <h2 className="text-xl font-bold text-gray-800">Información de la Cuenta</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
          </header>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {!isEditing ? (
                <div className="space-y-5">
                  <div className="flex items-center"><MdMail className="text-gray-400 mr-4" size={20}/><div className="text-sm"><p className="font-semibold text-text-dark">{user.email}</p><p className="text-xs text-text-light">Email</p></div></div>
                  <div className="flex items-center"><MdPhone className="text-gray-400 mr-4" size={20}/><div className="text-sm"><p className="font-semibold text-text-dark">{user.company_phone || 'No especificado'}</p><p className="text-xs text-text-light">Teléfono</p></div></div>
                  <div className="flex items-center"><MdCalendarToday className="text-gray-400 mr-4" size={20}/><div className="text-sm"><p className="font-semibold text-text-dark">{user.birth_date ? new Date(user.birth_date).toLocaleDateString('es-ES') : 'No especificado'}</p><p className="text-xs text-text-light">Fecha de Nacimiento</p></div></div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email (no se puede cambiar)</label>
                    <input type="email" value={user.email} readOnly className="mt-1 w-full p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input type="tel" name="companyPhone" value={formData.companyPhone} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                  </div>
                </div>
              )}
              <div className="mt-4">
                {error && <ErrorMessage message={error} />}
                {success && <div className="text-green-600 bg-green-50 p-3 rounded-md text-sm font-semibold">{success}</div>}
              </div>
            </div>
            {isEditing && (
              <footer className="flex justify-end p-5 border-t bg-gray-50 rounded-b-2xl">
                <button type="button" onClick={() => { setIsEditing(false); setError(''); setSuccess(''); }} className="bg-white border border-gray-300 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-100">Cancelar</button>
                <button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:opacity-50">
                  {isLoading && <FaSpinner className="animate-spin mr-2" />}
                  Guardar Cambios
                </button>
              </footer>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;