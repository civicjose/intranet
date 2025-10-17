// client/src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import EditUserModal from "../../components/admin/EditUserModal";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import AddUserModal from "../../components/admin/AddUserModal";
import ErrorMessage from "../../components/ErrorMessage";
import { MdEdit, MdDelete } from "react-icons/md";

function UserManagementPage() {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para agrupar todos los datos de la organización
  const [orgData, setOrgData] = useState({
    roles: [],
    departments: [],
    areas: [],
    positions: [],
    territories: [],
    locations: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      // Hacemos todas las peticiones en paralelo para cargar los datos de la organización
      const [usersRes, rolesRes, departmentsRes, areasRes, positionsRes, territoriesRes, locationsRes] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/roles"),
        apiClient.get("/departments"),
        apiClient.get("/areas"),
        apiClient.get("/positions"),
        apiClient.get("/territories"),
        apiClient.get("/locations"),
      ]);
      
      setUsers(usersRes.data);
      setOrgData({
        roles: rolesRes.data,
        departments: departmentsRes.data,
        areas: areasRes.data,
        positions: positionsRes.data,
        territories: territoriesRes.data,
        locations: locationsRes.data,
      });

    } catch (err) {
      setError("No se pudieron cargar los datos de la organización.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModals();
    fetchData();
  };
  
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    setError("");
    try {
      await apiClient.delete(`/users/${selectedUser.id}`);
      handleCloseModals();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo borrar el usuario.");
      handleCloseModals();
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
        <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignación</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url ? `${apiClient.defaults.baseURL.replace('/api', '')}${user.avatar_url}` : `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}`} alt="" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ user.role_name === "Admin" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                            {user.role_name || "Usuario"}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {user.area_name || user.departments?.map((dept) => dept.name).join(", ") || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEditClick(user)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={22} /></button>
                        <button onClick={() => handleDeleteClick(user)} className="text-red-600 hover:text-red-900 ml-4 disabled:text-gray-400" disabled={user.id === loggedInUser.id}>
                            <MdDelete size={22} />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        <div className="md:hidden grid grid-cols-1 gap-4">
            {users.map(user => (
                <div key={user.id} className="bg-white p-4 rounded-lg shadow">
                    {/* Contenido tarjeta móvil */}
                </div>
            ))}
        </div>
      </AdminPageLayout>

      {isEditModalOpen && (
        <EditUserModal
          user={selectedUser}
          orgData={orgData}
          onSaveSuccess={handleSaveSuccess}
          onClose={handleCloseModals}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Confirmar Borrado"
          message={`¿Eliminar a ${selectedUser?.first_name} ${selectedUser?.last_name}?`}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseModals}
          isLoading={isDeleting}
        />
      )}
      {isAddModalOpen && (
        <AddUserModal
          orgData={orgData}
          onSaveSuccess={handleSaveSuccess}
          onClose={handleCloseModals}
        />
      )}
    </>
  );
}

export default UserManagementPage;