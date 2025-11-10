// client/src/pages/TeamMemberProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { FaSpinner, FaFileWord } from 'react-icons/fa'; // Cambiado a FaFileWord
import ErrorMessage from '../components/ErrorMessage';
import JobProfileViewer from '../components/JobProfileViewer';

// ¡Ya no necesitamos jsPDF, html2canvas ni el componente de impresión!

const TeamMemberProfilePage = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false); // Nuevo estado

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const usersRes = await apiClient.get('/users');
                const targetUser = usersRes.data.find(u => u.id == userId);
                if (targetUser) setUser(targetUser);

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

    // --- NUEVA LÓGICA DE DESCARGA DE WORD ---
    const handleDownloadWord = async () => {
        setIsDownloading(true);
        setError('');
        try {
            const response = await apiClient.get(`/job-profiles/download-word/${userId}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `Ficha_Puesto_${user?.first_name}.docx`; // Fallback
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch.length === 2) {
                    fileName = fileNameMatch[1];
                }
            }
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error al descargar el documento:', err);
            setError('No se pudo generar el documento Word.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>;
    }

    return (
        <div>
            <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Ficha de Puesto</h1>
                    <p className="text-gray-500 mt-1">Viendo la ficha de: <span className="font-semibold text-macrosad-purple">{user?.first_name} {user?.last_name}</span></p>
                </div>
                <div className="flex gap-4">
                    <Link to="/my-team" className="text-macrosad-pink font-semibold hover:underline flex items-center">&larr; Volver a Mi Equipo</Link>
                    
                    {profile && (
                        <button
                            onClick={handleDownloadWord}
                            disabled={isDownloading}
                            className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isDownloading ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                <FaFileWord /> // Icono de Word
                            )}
                            {isDownloading ? 'Generando...' : 'Descargar Word'}
                        </button>
                    )}
                </div>
            </header>

            {error && <ErrorMessage message={error} />}

            {/* --- Visor web (el que ya tenías) --- */}
            <JobProfileViewer profile={profile} />

            {/* --- ¡Ya no hay componente de impresión oculto! --- */}
        </div>
    );
};

export default TeamMemberProfilePage;