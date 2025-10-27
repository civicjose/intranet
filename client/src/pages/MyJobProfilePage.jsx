// client/src/pages/MyJobProfilePage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';
import { MdBadge, MdBusiness, MdSupervisorAccount, MdCalendarToday, MdWork, MdBuild, MdCheckBox, MdList, MdCrisisAlert } from 'react-icons/md';

// Componente para una sección de la ficha
const ProfileSection = ({ title, icon, children }) => (
    <section>
        <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b flex items-center gap-3">
            {icon} {title}
        </h2>
        <div className="space-y-4 prose max-w-none text-gray-600">
            {children}
        </div>
    </section>
);

// Componente para un campo de texto enriquecido (lo renderiza de forma segura)
const RichTextViewer = ({ content }) => {
    if (!content) return <p className="text-gray-400 italic">No especificado</p>;
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

const MyJobProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const { data } = await apiClient.get('/job-profiles/my-profile');
                setProfile(data);
            } catch (err) {
                setError('No se pudo cargar tu ficha de puesto.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyProfile();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!profile) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-700">Mi Ficha de Puesto</h1>
                <p className="text-gray-500 mt-4">Aún no se ha generado una ficha de puesto para tu perfil.</p>
                <p className="text-gray-500">Contacta con tu supervisor para más información.</p>
            </div>
        );
    }

    return (
        <div>
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">Mi Ficha de Puesto</h1>
                <p className="text-gray-500 mt-1">Esta es la descripción de tu puesto actual en la organización.</p>
            </header>

            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-lg space-y-10">
                
                <section className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">Identificación</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div><p className="font-semibold text-gray-500">Puesto</p><p className="text-gray-800">{profile.position_name}</p></div>
                        <div><p className="font-semibold text-gray-500">Departamento</p><p className="text-gray-800">{profile.department_name}</p></div>
                        <div><p className="font-semibold text-gray-500">Supervisor</p><p className="text-gray-800">{profile.supervisor_name}</p></div>
                        <div><p className="font-semibold text-gray-500">Fecha</p><p className="text-gray-800">{new Date(profile.description_date).toLocaleDateString('es-ES')}</p></div>
                    </div>
                </section>

                <ProfileSection title="Objetivo del Puesto" icon={<MdBadge />}>
                    <RichTextViewer content={profile.objective} />
                </ProfileSection>

                <ProfileSection title="Funciones Principales" icon={<MdList />}>
                    <RichTextViewer content={profile.functions} />
                </ProfileSection>

                <ProfileSection title="Objetivos Anuales" icon={<MdCrisisAlert />}>
                    <RichTextViewer content={profile.annual_objectives} />
                </ProfileSection>

                <ProfileSection title="Herramientas y Equipos" icon={<MdBuild />}>
                    <RichTextViewer content={profile.tools_and_equipment} />
                </ProfileSection>
                
                <ProfileSection title="Competencias" icon={<MdCheckBox />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(profile.competencies).map(([key, value]) => (
                             <div key={key}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium capitalize">{key.replace('_', ' ')}</span>
                                    <span className="text-sm font-bold text-macrosad-purple">{value} / 5</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-macrosad-pink h-2.5 rounded-full" style={{ width: `${(value / 5) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ProfileSection>

            </div>
        </div>
    );
};

export default MyJobProfilePage;