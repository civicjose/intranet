// client/src/pages/admin/JobProfileEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { FaSpinner } from 'react-icons/fa';
import { MdEditDocument } from 'react-icons/md';
import ErrorMessage from '../../components/ErrorMessage';
import RichTextField from '../../components/admin/RichTextField'; // <-- Importamos el nuevo componente

const COMPETENCIES = [
    { id: 'flexibilidad', label: 'Flexibilidad / Adaptabilidad' },
    { id: 'responsabilidad', label: 'Responsabilidad' },
    { id: 'iniciativa', label: 'Iniciativa' },
    { id: 'orientacion_resultados', label: 'Orientación a Resultados' },
    { id: 'autoconfianza', label: 'Autoconfianza' },
];

const JobProfileEditor = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        position_name: '', department_name: '', supervisor_name: '', description_date: new Date().toISOString().slice(0, 10),
        objective: '', degree_required: '', complementary_training: '', technical_knowledge: '', experience_required: '',
        needs_recycling: false, recycling_frequency: '', recycling_knowledge: '',
        functions: '', tools_and_equipment: '',
        competencies: { flexibilidad: 3, responsabilidad: 3, iniciativa: 3, orientacion_resultados: 3, autoconfianza: 3 },
        annual_objectives: ''
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfileData = useCallback(async () => {
        try {
            const usersRes = await apiClient.get('/users');
            const targetUser = usersRes.data.find(u => u.id == userId);
            if (!targetUser) throw new Error("Usuario no encontrado.");
            setUser(targetUser);

            const profileRes = await apiClient.get(`/job-profiles/for-user/${userId}`);
            if (profileRes.data) {
                setFormData({
                    ...profileRes.data,
                    description_date: profileRes.data.description_date ? profileRes.data.description_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
                    competencies: profileRes.data.competencies || formData.competencies
                });
            } else {
                setFormData(prev => ({
                    ...prev,
                    position_name: targetUser.position_name || '',
                    department_name: targetUser.departments?.map(d => d.name).join(', ') || '',
                    supervisor_name: targetUser.supervisor_name || '',
                }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudieron cargar los datos.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRichTextChange = (fieldName, content) => {
        setFormData(prev => ({ ...prev, [fieldName]: content }));
    };

    const handleCompetencyChange = (id, value) => {
        setFormData(prev => ({
            ...prev,
            competencies: {
                ...prev.competencies,
                [id]: parseInt(value, 10)
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = { ...formData, user_id: userId };
            await apiClient.post('/job-profiles', payload);
            setSuccess('Ficha de puesto guardada con éxito.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar la ficha.');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>;
    if (error && !user) return <ErrorMessage message={error} />;

    return (
        <form onSubmit={handleSubmit}>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Ficha de Puesto</h1>
                    <p className="text-gray-500 mt-1">Editando la ficha para: <span className="font-semibold text-macrosad-purple">{user?.first_name} {user?.last_name}</span></p>
                </div>
                <Link to="/my-team" className="text-macrosad-pink font-semibold hover:underline">&larr; Volver a Mi Equipo</Link>
            </header>
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-10">
                
                {/* --- SECCIÓN IDENTIFICACIÓN --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">1. Identificación del Puesto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div><label className="block text-sm font-semibold text-gray-600">Denominación</label><input type="text" name="position_name" value={formData.position_name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50" /></div>
                        <div><label className="block text-sm font-semibold text-gray-600">Departamento</label><input type="text" name="department_name" value={formData.department_name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50" /></div>
                        <div><label className="block text-sm font-semibold text-gray-600">Supervisor</label><input type="text" name="supervisor_name" value={formData.supervisor_name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50" /></div>
                        <div><label className="block text-sm font-semibold text-gray-600">Fecha</label><input type="date" name="description_date" value={formData.description_date} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50" /></div>
                    </div>
                </section>

                {/* --- SECCIÓN DESCRIPCIÓN Y FORMACIÓN --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">2. Descripción y Requisitos</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="lg:col-span-2"><label className="block text-sm font-semibold text-gray-600 mb-1">Objetivo General del Puesto</label><RichTextField content={formData.objective} onUpdate={(c) => handleRichTextChange('objective', c)} /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Titulación Requerida</label><RichTextField content={formData.degree_required} onUpdate={(c) => handleRichTextChange('degree_required', c)} /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Experiencia Requerida</label><RichTextField content={formData.experience_required} onUpdate={(c) => handleRichTextChange('experience_required', c)} /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Formación Complementaria</label><RichTextField content={formData.complementary_training} onUpdate={(c) => handleRichTextChange('complementary_training', c)} /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Conocimientos Técnicos</label><RichTextField content={formData.technical_knowledge} onUpdate={(c) => handleRichTextChange('technical_knowledge', c)} /></div>
                    </div>
                </section>

                {/* --- SECCIÓN FUNCIONES Y OBJETIVOS --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">3. Responsabilidades Clave</h2>
                     <div className="space-y-6">
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Funciones Principales</label><RichTextField content={formData.functions} onUpdate={(c) => handleRichTextChange('functions', c)} className="min-h-[200px]" /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Herramientas y Equipos</label><RichTextField content={formData.tools_and_equipment} onUpdate={(c) => handleRichTextChange('tools_and_equipment', c)} /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Objetivos Anuales</label><RichTextField content={formData.annual_objectives} onUpdate={(c) => handleRichTextChange('annual_objectives', c)} className="min-h-[160px]" /></div>
                    </div>
                </section>

                {/* --- SECCIÓN COMPETENCIAS --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">4. Competencias</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {COMPETENCIES.map(comp => (
                            <div key={comp.id}>
                                <label className="block text-sm font-semibold text-gray-600">{comp.label}</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <input type="range" min="1" max="5" name={comp.id} value={formData.competencies[comp.id]} onChange={(e) => handleCompetencyChange(comp.id, e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-macrosad-pink" />
                                    <span className="font-bold text-lg text-macrosad-purple w-6 text-center">{formData.competencies[comp.id]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* --- MENSAJES Y BOTÓN DE GUARDAR --- */}
                <div className="pt-4 border-t">
                    {error && <ErrorMessage message={error} />}
                    {success && <div className="text-green-600 bg-green-50 p-3 rounded-md text-sm font-semibold mb-4">{success}</div>}
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving} className="bg-macrosad-pink text-white font-bold py-3 px-8 rounded-lg flex items-center disabled:opacity-50 transition-transform active:scale-95">
                            {isSaving && <FaSpinner className="animate-spin mr-2" />}
                            Guardar Ficha
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default JobProfileEditor;