import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import EditUserModal from '../../components/admin/EditUserModal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import AddUserModal from '../../components/admin/AddUserModal';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

function UserManagementPage() {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  
  // Estado de carga para acciones
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para limpiar el mensaje de error después de un tiempo
  const clearError = () => {
    setTimeout(() => {
        setError('');
    }, 5000); // El error desaparecerá después de 5 segundos
  };

  // Carga de todos los datos necesarios para la página
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersRes, rolesRes, departmentsRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/roles'),
        apiClient.get('/departments'),
      ]);

      setUsers(usersRes.data);
      setAllRoles(rolesRes.data);
      setAllDepartments(departmentsRes.data);

    } catch (err) {
      console.error("Error al cargar los datos:", err);
      setError('No se pudieron cargar los datos necesarios para la página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MANEJADORES PARA MODAL DE EDICIÓN ---
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };
  const handleSaveSuccess = () => {
    handleCloseEditModal();
    fetchData();
  };

  // --- MANEJADORES PARA MODAL DE BORRADO ---
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(true);
    setError('');
    try {
      await apiClient.delete(`/users/${selectedUser.id}`);
      handleCloseDeleteModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo borrar el usuario.');
      clearError();
      handleCloseDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  // --- MANEJADORES PARA MODAL DE AÑADIR ---
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };
  const handleAddSuccess = () => {
    handleCloseAddModal();
    fetchData();
  };

  if (loading) return <div className="text-center p-8">Cargando datos de administración...</div>;

  return (
    <div>
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-500">Añade, edita o elimina usuarios del sistema.</p>
        </div>
        <button onClick={handleAddClick} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
            + Añadir Usuario
        </button>
      </header>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamentos</th>
              <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.email}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role_name === 'Admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{user.role_name || 'Usuario'}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{user.departments?.map(dept => dept.name).join(', ') || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEditClick(user)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                  <button 
                    onClick={() => handleDeleteClick(user)} 
                    className="text-red-600 hover:text-red-900 ml-4 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={user.id === loggedInUser.id}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <EditUserModal 
          user={selectedUser}
          roles={allRoles}
          departments={allDepartments}
          onSaveSuccess={handleSaveSuccess}
          onClose={handleCloseEditModal}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Confirmar Borrado"
          message={`¿Estás seguro de que quieres eliminar a ${selectedUser?.first_name} ${selectedUser?.last_name}? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDeleteModal}
          isLoading={isDeleting}
        />
      )}

      {isAddModalOpen && (
        <AddUserModal
          roles={allRoles}
          departments={allDepartments}
          onSaveSuccess={handleAddSuccess}
          onClose={handleCloseAddModal}
        />
      )}
    </div>
  );
}

export default UserManagementPage;