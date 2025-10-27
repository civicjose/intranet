// client/src/components/TeamMemberDocumentation.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { MdEdit, MdVisibility, MdOutlineBadge, MdDelete } from 'react-icons/md';
import ConfirmationModal from './admin/ConfirmationModal';

const TeamMemberDocumentation = ({ user }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setError('');
        try {
            await apiClient.delete(`/job-profiles/${user.id}`);
            // Podríamos forzar un refresh o mostrar un mensaje de éxito.
            // Por ahora, simplemente cerramos el modal. La próxima vez que se cargue la página, la ficha no estará.
            setIsDeleteModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo eliminar la ficha.');
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Gestionar Documentos</h3>
                {error && <ErrorMessage message={error} />}
                <div className="space-y-3">
                    {/* Fila para "Ficha de Puesto" */}
                    <div className="flex justify-between items-center p-3 rounded-md hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <MdOutlineBadge className="text-gray-500" size={22} />
                            <span className="font-semibold text-gray-700">Ficha de Puesto</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to={`/admin/job-profile/${user.id}`} title="Editar" className="text-gray-500 hover:text-macrosad-purple p-2 rounded-full transition-colors hover:bg-gray-100"><MdEdit size={20} /></Link>
                            <button onClick={handleDeleteClick} title="Eliminar" className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors hover:bg-red-50"><MdDelete size={20} /></button>
                        </div>
                    </div>
                    {/* Aquí irían más filas para otros documentos en el futuro */}
                </div>
            </div>

            {isDeleteModalOpen && (
                <ConfirmationModal
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar la ficha de puesto de ${user.first_name}? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => setIsDeleteModalOpen(false)}
                    isLoading={isDeleting}
                />
            )}
        </>
    );
};

export default TeamMemberDocumentation;