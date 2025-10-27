// client/src/pages/TeamMemberProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';
import JobProfileViewer from '../components/JobProfileViewer'; // Importamos el visor

const TeamMemberProfilePage = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null); // Para mostrar el nombre del empleado
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Obtenemos los datos del usuario para mostrar su nombre
                const usersRes = await apiClient.get('/users');
                const targetUser = usersRes.data.find(u => u.id == userId);
                if (targetUser) {
                    setUser(targetUser);
                }

                // Obtenemos la ficha del puesto (la API ya valida el permiso)
                const { data } = await apiClient.get(`/job-profiles/for-user/${userId}`);
                setProfile(data);
            } catch (err) {
                setError(err.response?.data?.message || 'No se pudo cargar la ficha de puesto.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [userId]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Ficha de Puesto</h1>
                    <p className="text-gray-500 mt-1">Viendo la ficha de: <span className="font-semibold text-macrosad-purple">{user?.first_name} {user?.last_name}</span></p>
                </div>
                <Link to="/my-team" className="text-macrosad-pink font-semibold hover:underline">&larr; Volver a Mi Equipo</Link>
            </header>

            <JobProfileViewer profile={profile} />
        </div>
    );
};

export default TeamMemberProfilePage;