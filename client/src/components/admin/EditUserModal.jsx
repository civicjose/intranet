// client/src/components/admin/EditUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../services/api';
import ErrorMessage from '../ErrorMessage';
import { MdClose, MdPerson, MdMail, MdPhone, MdCameraAlt } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';

const FormInput = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
    <input {...props} className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-macrosad-pink focus:border-macrosad-pink" />
  </div>
);

const EditUserModal = ({ user, orgData, onSaveSuccess, onClose }) => {
  const { 
    roles = [], departments = [], areas = [], positions = [], territories = [], locations = [] 
  } = orgData || {};
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', companyPhone: '', role_id: '',
    departments: [], area_id: '', position_id: '', territory_id: '', location_id: '', avatar_url: ''
  });
  
  const [assignmentType, setAssignmentType] = useState('department');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const initialData = {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        companyPhone: user.company_phone || '',
        role_id: user.role_id || '',
        departments: user.departments?.map(dept => dept.id) || [],
        area_id: user.area_id || '',
        position_id: user.position_id || '',
        territory_id: user.territory_id || '',
        location_id: user.location_id || '',
        avatar_url: user.avatar_url || ''
      };
      setFormData(initialData);
      setImagePreview(user.avatar_url ? `${apiClient.defaults.baseURL.replace('/api', '')}${user.avatar_url}` : '');

      if (user.area_id) {
        setAssignmentType('area');
      } else {
        setAssignmentType('department');
      }
    }
  }, [user]);
  
  const handleAssignmentTypeChange = (type) => {
    setAssignmentType(type);
    if (type === 'area') setFormData(prev => ({ ...prev, departments: [] }));
    else setFormData(prev => ({ ...prev, area_id: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (departmentId) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(departmentId)
        ? prev.departments.filter(id => id !== departmentId)
        : [...prev.departments, departmentId]
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let finalAvatarUrl = formData.avatar_url;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile); // La clave debe ser 'image'
        const res = await apiClient.post('/upload', imageFormData, { // CORRECCIÓN: Usar la ruta /upload
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalAvatarUrl = res.data.url;
      }

      const payload = { ...formData, avatar_url: finalAvatarUrl, role_id: Number(formData.role_id) };

      if (assignmentType === 'area') payload.departments = [];
      else payload.area_id = null;
      
      await apiClient.put(`/users/${user.id}`, payload);
      onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Editar Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            
            <fieldset>
              <legend className="text-lg font-semibold text-gray-800 mb-3">Datos Personales</legend>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative flex-shrink-0">
                      <img 
                          src={imagePreview || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=e5007e&color=fff&bold=true`} 
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button type="button" onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-macrosad-pink text-white p-1.5 rounded-full hover:bg-opacity-90 transition-transform hover:scale-110 shadow-md">
                          <MdCameraAlt />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow w-full">
                      <FormInput icon={<MdPerson className="text-gray-400"/>} type="text" name="firstName" placeholder="Nombre" value={formData.firstName} onChange={handleChange} required />
                      <FormInput icon={<MdPerson className="text-gray-400"/>} type="text" name="lastName" placeholder="Apellidos" value={formData.lastName} onChange={handleChange} required />
                      <div className="sm:col-span-2">
                          <FormInput icon={<MdMail className="text-gray-400"/>} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                      </div>
                      <div className="sm:col-span-2">
                          <FormInput icon={<MdPhone className="text-gray-400"/>} type="tel" name="companyPhone" placeholder="Teléfono de empresa" value={formData.companyPhone} onChange={handleChange} />
                      </div>
                  </div>
              </div>
            </fieldset>
            
            <fieldset>
              <legend className="text-lg font-semibold text-gray-800 mb-3">Asignación Organizativa</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Rol</label>
                  <select name="role_id" value={formData.role_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                    {roles.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Puesto</label>
                  <select name="position_id" value={formData.position_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="">-- Sin puesto --</option>
                    {positions.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-4 mb-2">
                      <label className="flex items-center"><input type="radio" name="assignmentType" value="department" checked={assignmentType === 'department'} onChange={() => handleAssignmentTypeChange('department')} className="text-macrosad-pink focus:ring-macrosad-pink" /><span className="ml-2 text-sm">Por Departamento(s)</span></label>
                      <label className="flex items-center"><input type="radio" name="assignmentType" value="area" checked={assignmentType === 'area'} onChange={() => handleAssignmentTypeChange('area')} className="text-macrosad-pink focus:ring-macrosad-pink" /><span className="ml-2 text-sm">Por Área</span></label>
                  </div>
                  {assignmentType === 'department' ? (
                     <div className="bg-gray-50 p-3 rounded-md border max-h-32 overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {departments.map(dept => (<label key={dept.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-200 cursor-pointer"><input type="checkbox" checked={formData.departments.includes(dept.id)} onChange={() => handleDepartmentChange(dept.id)} className="rounded text-macrosad-pink" /><span className="text-sm text-gray-700 select-none">{dept.name}</span></label>))}
                        </div>
                     </div>
                  ) : (
                    <select name="area_id" value={formData.area_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="">-- Selecciona un área --</option>
                      {areas.map(area => (<option key={area.id} value={area.id}>{area.name}</option>))}
                    </select>
                  )}
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-gray-800 mb-3">Ubicación</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Territorio</label>
                  <select name="territory_id" value={formData.territory_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="">-- Sin territorio --</option>
                      {territories.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Centro / Sede</label>
                  <select name="location_id" value={formData.location_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                       <option value="">-- Sin ubicación --</option>
                      {locations.map(l => (<option key={l.id} value={l.id}>{l.name} ({l.type})</option>))}
                  </select>
                </div>
            </div>
            </fieldset>
            
            {error && <ErrorMessage message={error} />}
          </div>

          <footer className="flex justify-end p-5 border-t bg-gray-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="bg-white border font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={isLoading} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:opacity-50">
              {isLoading && <FaSpinner className="animate-spin mr-2" />}
              Guardar Cambios
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;