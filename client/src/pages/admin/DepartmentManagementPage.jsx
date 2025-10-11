import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { MdEdit, MdDelete } from 'react-icons/md';
import ErrorMessage from '../../components/ErrorMessage';
import DepartmentModal from '../../components/admin/DepartmentModal'; // Importamos el nuevo modal
import ConfirmationModal from '../../components/admin/ConfirmationModal'; // Y el de confirmación

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para los modales
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/departments');
      setDepartments(data);
    } catch (err) {
      setError('No se pudo cargar la lista de departamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const clearError = () => setTimeout(() => setError(''), 5000);

  // --- MANEJADORES DE MODALES ---
  
  const handleOpenModal = (dept = null) => {
    setSelectedDept(dept); // Si no hay 'dept', es para añadir
    setIsDeptModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeptModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedDept(null);
  };

  const handleSave = async (deptData) => {
    try {
      if (deptData.id) {
        // Editando
        await apiClient.put(`/departments/${deptData.id}`, { name: deptData.name });
      } else {
        // Creando
        await apiClient.post('/departments', { name: deptData.name });
      }
      handleCloseModal();
      fetchDepartments(); // Recarga la lista
    } catch (err) {
      // Dejamos que el modal maneje el error de guardado
      throw err;
    }
  };

  const handleDeleteClick = (dept) => {
    setSelectedDept(dept);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDept) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`/departments/${selectedDept.id}`);
      handleCloseModal();
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo borrar el departamento.');
      clearError();
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Cargando departamentos...</div>;

  return (
    <div>
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Departamentos</h1>
          <p className="text-gray-500">Añade, edita o elimina los departamentos de la empresa.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
            + Añadir Departamento
        </button>
      </header>

      <div className="bg-light-card shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {departments.map((dept) => (
            <li key={dept.id} className="p-4 flex justify-between items-center hover:bg-light-bg">
              <span className="font-semibold text-text-dark">{dept.name}</span>
              <div className="space-x-4">
                <button onClick={() => handleOpenModal(dept)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={20} /></button>
                <button onClick={() => handleDeleteClick(dept)} className="text-red-600 hover:text-red-900"><MdDelete size={20} /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isDeptModalOpen && (
        <DepartmentModal 
          department={selectedDept}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal 
          title="Confirmar Borrado"
          message={`¿Estás seguro de que quieres eliminar el departamento "${selectedDept?.name}"?`}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseModal}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default DepartmentManagementPage;