import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import EditUserModal from "../../components/admin/EditUserModal";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import AddUserModal from "../../components/admin/AddUserModal";
import ErrorMessage from "../../components/ErrorMessage";

function UserManagementPage() {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersRes, rolesRes, departmentsRes] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/roles"),
        apiClient.get("/departments"),
      ]);
      setUsers(usersRes.data);
      setAllRoles(rolesRes.data);
      setAllDepartments(departmentsRes.data);
    } catch (err) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearError = () => setTimeout(() => setError(""), 5000);

  // --- MANEJADORES DE MODALES ---
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
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };
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

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    setError("");
    try {
      await apiClient.delete(`/users/${selectedUser.id}`);
      handleCloseDeleteModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo borrar el usuario.");
      clearError();
      handleCloseDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <>
      <AdminPageLayout
        title="Gestión de Usuarios"
        subtitle="Añade, edita o elimina usuarios del sistema."
        buttonLabel="+ Añadir Usuario"
        onButtonClick={handleAddClick}
      >
        {error && (
          <div className="p-4 border-b">
            <ErrorMessage message={error} />
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Departamentos
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role_name === "Admin"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role_name || "Usuario"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                  {user.departments?.map((dept) => dept.name).join(", ") ||
                    "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </button>
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
      </AdminPageLayout>

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
          message={`¿Eliminar a ${selectedUser?.first_name} ${selectedUser?.last_name}?`}
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
    </>
  );
}

export default UserManagementPage;
