import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';

const TeamMemberCard = ({ member }) => {
    const getAvatarUrl = (path) => path ? `${apiClient.defaults.baseURL.replace('/api', '')}${path}` : null;
    const avatarSrc = getAvatarUrl(member.avatar_url);

    return (
        <Link 
            to={`/team/member/${member.id}/documentation`} // <-- ENLACE A LA NUEVA PÁGINA
            className="group bg-white rounded-lg shadow-md p-4 flex flex-col text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        >
            <div className="flex-grow w-full">
                <img
                    src={avatarSrc || `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=E5007E&color=fff`}
                    alt={`${member.first_name} ${member.last_name}`}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0 mx-auto"
                />
                <div className="mt-2 overflow-hidden">
                    <p className="font-bold text-gray-800 group-hover:text-macrosad-pink transition-colors">{member.first_name} {member.last_name}</p>
                    <p className="text-sm text-gray-500 truncate">{member.position_name || 'Puesto no asignado'}</p>
                </div>
            </div>
            <div className="w-full mt-auto pt-3 border-t border-gray-100 mt-3">
                 <span className="text-xs font-semibold text-macrosad-purple/70 group-hover:text-macrosad-purple">Gestionar Documentación</span>
            </div>
        </Link>
    );
};


const MyTeamPage = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTeam = async () => {
        try {
            // Reiniciamos el estado para reflejar la carga
            setLoading(true);
            const { data } = await apiClient.get('/users/my-team');
            setTeam(data);
        } catch (err) {
            setError('No se pudo cargar la información de tu equipo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);
    
    const groupedTeam = useMemo(() => {
        if (!team || team.length === 0) return {};
        const groups = {};
        team.forEach(member => {
            let mainAreaName = member.area_name;
            if (!mainAreaName && member.departments && member.departments.length > 0) {
                mainAreaName = member.departments[0].area_name;
            }
            mainAreaName = mainAreaName || 'Sin Área Asignada';
            if (!groups[mainAreaName]) {
                groups[mainAreaName] = { directMembers: [], departments: {} };
            }
            if (member.departments && member.departments.length > 0) {
                member.departments.forEach(dept => {
                    const deptAreaName = dept.area_name || mainAreaName;
                    if (!groups[deptAreaName]) {
                        groups[deptAreaName] = { directMembers: [], departments: {} };
                    }
                    if (!groups[deptAreaName].departments[dept.name]) {
                        groups[deptAreaName].departments[dept.name] = [];
                    }
                    groups[deptAreaName].departments[dept.name].push(member);
                });
            } else if (member.area_id) {
                groups[mainAreaName].directMembers.push(member);
            } else {
                 if (!groups['Sin Asignación']) {
                    groups['Sin Asignación'] = { directMembers: [], departments: {} };
                }
                groups['Sin Asignación'].directMembers.push(member);
            }
        });
        
        return Object.keys(groups).sort().reduce((acc, areaName) => {
            const area = groups[areaName];
            const sortedDepartments = Object.keys(area.departments).sort().reduce((deptAcc, deptName) => {
                deptAcc[deptName] = area.departments[deptName];
                return deptAcc;
            }, {});

            if (area.directMembers.length > 0 || Object.keys(sortedDepartments).length > 0) {
                acc[areaName] = {
                    directMembers: area.directMembers,
                    departments: sortedDepartments
                };
            }
            return acc;
        }, {});

    }, [team]);

    const handleDeleteClick = (member) => {
        setUserToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        setError('');
        try {
            await apiClient.delete(`/job-profiles/${userToDelete.id}`);
            // Opcional: podrías mostrar una notificación de éxito aquí.
            // No es necesario recargar los datos del equipo (fetchTeam) ya que la ficha no afecta a la lista de usuarios.
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo eliminar la ficha.');
            handleCloseModal();
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <>
            <div>
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Mi Equipo</h1>
                    <p className="text-gray-500 mt-1">Aquí puedes ver a todos los miembros de tu equipo y gestionar sus fichas de puesto.</p>
                </header>

                {Object.keys(groupedTeam).length > 0 ? (
                    <div className="space-y-10">
                        {Object.entries(groupedTeam).map(([areaName, areaContent]) => (
                            <section key={areaName}>
                                <h2 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-macrosad-pink pl-3">{areaName}</h2>
                                {areaContent.directMembers.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                                        {areaContent.directMembers.map(member => (
                                            <TeamMemberCard key={member.id} member={member} onDeleteClick={handleDeleteClick} />
                                        ))}
                                    </div>
                                )}
                                {Object.entries(areaContent.departments).map(([deptName, members]) => (
                                    <div key={deptName} className="ml-4 mt-4">
                                        <h3 className="font-semibold text-gray-600 mb-3">{deptName}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {members.map(member => (
                                                <TeamMemberCard key={`${member.id}-${deptName}`} member={member} onDeleteClick={handleDeleteClick} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">Actualmente no tienes a nadie a tu cargo.</p>
                    </div>
                )}
            </div>
            
            {isDeleteModalOpen && (
                <ConfirmationModal
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar la ficha de puesto de ${userToDelete?.first_name} ${userToDelete?.last_name}? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onClose={handleCloseModal}
                    isLoading={isDeleting}
                />
            )}
        </>
    );
};

export default MyTeamPage;