// client/src/pages/TeamMemberDocumentationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';
import { MdEdit, MdVisibility, MdOutlineBadge, MdDelete } from 'react-icons/md';
import ConfirmationModal from '../components/admin/ConfirmationModal';

const TeamMemberDocumentationPage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [profileExists, setProfileExists] = useState(false); // Para saber si la ficha existe
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Función para comprobar el estado de los documentos
    const checkDocuments = async () => {
        try {
            setLoading(true);
            // Comprobamos si la ficha de puesto existe
            const profileRes = await apiClient.get(`/job-profiles/for-user/${userId}`);
            setProfileExists(!!profileRes.data); // true si hay datos, false si es null

            // Obtenemos los datos del usuario para el encabezado
            if (!user) {
                const usersRes = await apiClient.get('/users');
                const targetUser = usersRes.data.find(u => u.id == userId);
                if (targetUser) setUser(targetUser);
                else throw new Error("Usuario no encontrado.");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo cargar la información.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkDocuments();
    }, [userId]);

    const handleDeleteClick = () => setIsDeleteModalOpen(true);
    const handleCloseModal = () => setIsDeleteModalOpen(false);

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setError('');
        try {
            await apiClient.delete(`/job-profiles/${user.id}`);
            setIsDeleteModalOpen(false);
            checkDocuments(); // Volvemos a comprobar los documentos para actualizar el estado de los botones
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo eliminar la ficha.');
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>;
    if (error && !user) return <ErrorMessage message={error} />;

    return (
        <>
            <div>
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Documentación del Empleado</h1>
                        <p className="text-gray-500 mt-1">Gestionando documentos de: <span className="font-semibold text-macrosad-purple">{user?.first_name} {user?.last_name}</span></p>
                    </div>
                    <Link to="/my-team" className="text-macrosad-pink font-semibold hover:underline">&larr; Volver a Mi Equipo</Link>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Documentos Disponibles</h3>
                    {error && <ErrorMessage message={error} />}
                    <div className="space-y-3">
                        {/* Fila para "Ficha de Puesto" */}
                        <div className="flex justify-between items-center p-3 rounded-md hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <MdOutlineBadge className="text-gray-500" size={22} />
                                <span className="font-semibold text-gray-700">Ficha de Puesto</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to={`/team/profile/${user.id}`} title="Ver Ficha" className={`p-2 rounded-full transition-colors ${!profileExists ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-macrosad-purple hover:bg-gray-100'}`} onClick={(e) => !profileExists && e.preventDefault()}><MdVisibility size={20} /></Link>
                                <Link to={`/admin/job-profile/${user.id}`} title={profileExists ? 'Editar Ficha' : 'Crear Ficha'} className="text-gray-500 hover:text-macrosad-purple p-2 rounded-full transition-colors hover:bg-gray-100"><MdEdit size={20} /></Link>
                                <button onClick={handleDeleteClick} title="Eliminar Ficha" disabled={!profileExists} className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"><MdDelete size={20} /></button>
                            </div>
                        </div>
                        {/* Aquí irían más filas para otros documentos en el futuro */}
                    </div>
                </div>
            </div>
            
            {isDeleteModalOpen && (
                <ConfirmationModal
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar la ficha de puesto de ${user.first_name}? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onClose={handleCloseModal}
                    isLoading={isDeleting}
                />
            )}
        </>
    );
};

export default TeamMemberDocumentationPage;