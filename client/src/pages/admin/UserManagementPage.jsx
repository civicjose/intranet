// client/src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import EditUserModal from "../../components/admin/EditUserModal";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import AddUserModal from "../../components/admin/AddUserModal";
import ErrorMessage from "../../components/ErrorMessage";
import { MdEdit, MdDelete, MdDragIndicator } from "react-icons/md";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableUserRow = ({ user, loggedInUser, onEditClick, onDeleteClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: user.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <tr ref={setNodeRef} style={style} {...attributes}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <button {...listeners} className="cursor-grab text-gray-400 mr-2 p-2">
                        <MdDragIndicator size={20} />
                    </button>
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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role_name === "Admin" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                    {user.role_name || "Usuario"}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                {user.area_name || user.departments?.map((dept) => dept.name).join(", ") || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.supervisor_name || <span className="italic">N/A</span>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEditClick(user)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={22} /></button>
                <button onClick={() => onDeleteClick(user)} className="text-red-600 hover:text-red-900 ml-4 disabled:text-gray-400" disabled={user.id === loggedInUser.id}>
                    <MdDelete size={22} />
                </button>
            </td>
        </tr>
    );
};

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
    const [orgData, setOrgData] = useState({
        roles: [],
        departments: [],
        areas: [],
        positions: [],
        territories: [],
        locations: [],
        users: []
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const [usersRes, rolesRes, departmentsRes, areasRes, positionsRes, territoriesRes, locationsRes] = await Promise.all([
                apiClient.get("/users"),
                apiClient.get("/roles"),
                apiClient.get("/departments"),
                apiClient.get("/areas"),
                apiClient.get("/positions"),
                apiClient.get("/territories"),
                apiClient.get("/locations"),
            ]);
            
            const allUsers = usersRes.data;
            setUsers(allUsers);
            setOrgData({
                roles: rolesRes.data,
                departments: departmentsRes.data,
                areas: areasRes.data,
                positions: positionsRes.data,
                territories: territoriesRes.data,
                locations: locationsRes.data,
                users: allUsers,
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
    
    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
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

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = users.findIndex((u) => u.id === active.id);
            const newIndex = users.findIndex((u) => u.id === over.id);
            const newOrder = arrayMove(users, oldIndex, newIndex);
            setUsers(newOrder);

            try {
                const orderedIds = newOrder.map(u => u.id);
                await apiClient.put('/users/reorder', { orderedIds });
            } catch (err) {
                setError("No se pudo guardar el nuevo orden. Por favor, recarga la página.");
                fetchData();
            }
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
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <SortableContext items={users.map(u => u.id)} strategy={verticalListSortingStrategy}>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <DraggableUserRow 
                                            key={user.id} 
                                            user={user}
                                            loggedInUser={loggedInUser}
                                            onEditClick={handleEditClick}
                                            onDeleteClick={handleDeleteClick}
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </table>
                    </DndContext>
                </div>
            </AdminPageLayout>

            {isEditModalOpen && (
                <EditUserModal user={selectedUser} orgData={orgData} onSaveSuccess={handleSaveSuccess} onClose={handleCloseModals} />
            )}
            {isDeleteModalOpen && (
                <ConfirmationModal title="Confirmar Borrado" message={`¿Eliminar a ${selectedUser?.first_name} ${selectedUser?.last_name}?`} onConfirm={handleConfirmDelete} onClose={handleCloseModals} isLoading={isDeleting} />
            )}
            {isAddModalOpen && (
                <AddUserModal orgData={orgData} onSaveSuccess={handleSaveSuccess} onClose={handleCloseModals} />
            )}
        </>
    );
}

export default UserManagementPage;