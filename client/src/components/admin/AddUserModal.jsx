// client/src/components/admin/AddUserModal.jsx
import React, { useState, useMemo } from 'react';
import apiClient from '../../services/api';
import ErrorMessage from '../ErrorMessage';
import { MdClose, MdPerson, MdMail, MdLock, MdPhone, MdCalendarToday } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';

const FormInput = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
    <input {...props} className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-macrosad-pink focus:border-macrosad-pink" />
  </div>
);

const AddUserModal = ({ orgData, onSaveSuccess, onClose }) => {
  const { 
    roles = [], departments = [], areas = [], positions = [], territories = [], locations = [], users = [] 
  } = orgData || {};

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', companyPhone: '', birthDate: '', password: '', confirmPassword: '',
    role_id: roles.length > 0 ? roles.find(r => r.name === 'Usuario')?.id || roles[0].id : '',
    departments: [], area_id: '', position_id: '', territory_id: '', location_id: '',
    supervisor_id: ''
  });
  
  const [creationMethod, setCreationMethod] = useState('invite');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (creationMethod === 'direct' && (name === 'password' || name === 'confirmPassword')) {
        const pass = name === 'password' ? value : formData.password;
        const confirmPass = name === 'confirmPassword' ? value : formData.confirmPassword;
        if (pass && confirmPass && pass !== confirmPass) setPasswordError('Las contraseñas no coinciden.');
        else setPasswordError('');
    }
  };

  const handleDepartmentChange = (departmentId) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(departmentId) ? prev.departments.filter(id => id !== departmentId) : [...prev.departments, departmentId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError) return;
    setIsLoading(true);
    setError('');
    try {
      const payload = { ...formData, role_id: Number(formData.role_id), creationMethod };
      if (creationMethod === 'direct' && !formData.password) {
          setError('La contraseña es obligatoria para la creación directa.');
          setIsLoading(false);
          return;
      }
      if (creationMethod === 'invite') {
          delete payload.password;
          delete payload.confirmPassword;
      }
      
      await apiClient.post('/users', payload);
      onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el usuario.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredDepartments = useMemo(() => {
    if (!formData.area_id) {
        return departments;
    }
    return departments.filter(dept => dept.area_id === Number(formData.area_id));
  }, [formData.area_id, departments]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Añadir Nuevo Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            <div className="p-1.5 bg-gray-200 rounded-lg flex">
                <button type="button" onClick={() => setCreationMethod('invite')} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${creationMethod === 'invite' ? 'bg-white shadow' : 'text-gray-600'}`}>Invitar por Email</button>
                <button type="button" onClick={() => setCreationMethod('direct')} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${creationMethod === 'direct' ? 'bg-white shadow' : 'text-gray-600'}`}>Crear Directamente</button>
            </div>

            <fieldset>
              <legend className="text-lg font-semibold text-gray-800 mb-3">Datos Personales</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput icon={<MdPerson className="text-gray-400"/>} type="text" name="firstName" placeholder="Nombre" value={formData.firstName} onChange={handleChange} required />
                <FormInput icon={<MdPerson className="text-gray-400"/>} type="text" name="lastName" placeholder="Apellidos" value={formData.lastName} onChange={handleChange} required />
                <FormInput icon={<MdMail className="text-gray-400"/>} type="email" name="email" placeholder="Email Corporativo" value={formData.email} onChange={handleChange} required />
                <FormInput icon={<MdPhone className="text-gray-400"/>} type="tel" name="companyPhone" placeholder="Teléfono" value={formData.companyPhone} onChange={handleChange} />
                <FormInput icon={<MdCalendarToday className="text-gray-400"/>} type="text" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} name="birthDate" placeholder="Fecha de Nacimiento" value={formData.birthDate} onChange={handleChange} />
              </div>
            </fieldset>

            {creationMethod === 'direct' && (
              <fieldset>
                <legend className="text-lg font-semibold text-gray-800 mb-3">Contraseña</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput icon={<MdLock className="text-gray-400"/>} type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
                    <FormInput icon={<MdLock className="text-gray-400"/>} type="password" name="confirmPassword" placeholder="Confirmar Contraseña" value={formData.confirmPassword} onChange={handleChange} required />
                    {passwordError && <p className="text-red-500 text-xs md:col-span-2 -mt-2">{passwordError}</p>}
                </div>
              </fieldset>
            )}

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
                  <label className="block text-sm font-medium text-gray-500 mb-1">Supervisor Directo</label>
                  <select name="supervisor_id" value={formData.supervisor_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="">-- Sin supervisor --</option>
                    {users.map(supervisor => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.first_name} {supervisor.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Área Principal</label>
                    <select name="area_id" value={formData.area_id} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="">-- Selecciona un área --</option>
                      {areas.map(area => (<option key={area.id} value={area.id}>{area.name}</option>))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Departamentos Asignados</label>
                    <div className="bg-gray-50 p-3 rounded-md border max-h-32 overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {filteredDepartments.map(dept => (
                                <label key={dept.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-200 cursor-pointer">
                                    <input type="checkbox" checked={formData.departments.includes(dept.id)} onChange={() => handleDepartmentChange(dept.id)} className="rounded text-macrosad-pink" />
                                    <span className="text-sm text-gray-700 select-none">{dept.name}</span>
                                </label>
                            ))}
                        </div>
                     </div>
                     {formData.area_id && <p className="text-xs text-gray-500 mt-1">Mostrando departamentos del área seleccionada.</p>}
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
              {creationMethod === 'invite' ? 'Enviar Invitación' : 'Crear Usuario'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;