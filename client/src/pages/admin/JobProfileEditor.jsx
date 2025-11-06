// client/src/pages/admin/JobProfileEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { FaSpinner, FaTrash, FaPlus } from 'react-icons/fa';
import ErrorMessage from '../../components/ErrorMessage';
import RichTextField from '../../components/admin/RichTextField';

// Componente para campos de texto simples (reutilizable)
const SimpleTextField = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
        {type === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                className="mt-1 w-full p-2 border rounded-md bg-gray-50 min-h-[100px] focus:ring-macrosad-pink focus:border-macrosad-pink"
            />
        ) : (
            <input
                id={name}
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                className="mt-1 w-full p-2 border rounded-md bg-gray-50 focus:ring-macrosad-pink focus:border-macrosad-pink"
            />
        )}
    </div>
);

// Definición de competencias según el Word
const COMPETENCIES = [
    { id: 'flexibilidad', label: 'Flexibilidad / Adaptabilidad' },
    { id: 'responsabilidad', label: 'Responsabilidad' },
    { id: 'iniciativa', label: 'Iniciativa' },
    { id: 'orientacion_resultados', label: 'Orientación a Resultados' },
    { id: 'autoconfianza', label: 'Autoconfianza' },
];

// Lista fija de riesgos del puesto (en formato de oración)
const JOB_RISKS_LIST = [
    { key: 'caida_distinto_nivel', label: 'Caída de personas a distinto nivel' },
    { key: 'caida_mismo_nivel', label: 'Caída de personas al mismo nivel' },
    { key: 'caida_objetos_desplome', label: 'Caída de objetos por desplome o derrumbamiento' },
    { key: 'caida_objetos_manipulacion', label: 'Caída de objetos en manipulación' },
    { key: 'caida_objetos_desprendidos', label: 'Caída de objetos desprendidos' },
    { key: 'pisada_objetos', label: 'Pisada sobre objetos' },
    { key: 'choque_inmoviles', label: 'Choque contra objetos inmóviles' },
    { key: 'choque_moviles', label: 'Choque contra objetos móviles' },
    { key: 'golpe_corte_pinchazo', label: 'Golpe/corte/pinchazo por objetos, materiales o herramientas' },
    { key: 'proyeccion_fragmentos', label: 'Proyección de fragmentos o partículas' },
    { key: 'atrapamiento_objetos', label: 'Atrapamiento por o entre objetos' },
    { key: 'contacto_electrico_directo', label: 'Contacto eléctrico directo' },
    { key: 'contacto_electrico_indirecto', label: 'Contacto eléctrico indirecto' },
    { key: 'incendio', label: 'Incendio: Factores de inicio, propagación, medios de lucha y/o evacuación' },
    { key: 'atropello_vehiculos', label: 'Atropello o golpe con vehículos' },
    { key: 'atraco_robo', label: 'Atraco o robo' },
    { key: 'accidente_trafico', label: 'Desplazamiento in itinere / en misión - Accidente laboral de tráfico' },
    { key: 'exposicion_quimicos', label: 'Exposición a agentes químicos' },
    { key: 'exposicion_fisicos_ruido', label: 'Exposición a agentes físicos. Ruido y/o ultrasonido' },
    { key: 'posturas_trabajo', label: 'Posturas de trabajo' },
    { key: 'sobreesfuerzos', label: 'Sobreesfuerzos' },
    { key: 'manipulacion_cargas', label: 'Manipulación manual de cargas' },
    { key: 'fatiga_mental', label: 'Fatiga mental. Recepción, tratamiento y/o respuesta a la información' },
    { key: 'fatiga_visual', label: 'Fatiga visual' },
    { key: 'insatisfaccion', label: 'Insatisfacción' },
    { key: 'estres_laboral', label: 'Estrés laboral' },
    { key: 'violencia_acoso', label: 'Violencia en el trabajo, acoso sexual y acoso por trato' },
    { key: 'tiempo_trabajo', label: 'Tiempo de trabajo' },
    { key: 'organizacion_preventiva', label: 'Organización preventiva y del trabajo/Factores personales-individuales' },
    { key: 'riesgo_psicosocial', label: 'Riesgo psicosocial' },
];

// Estado inicial por defecto para una ficha nueva
const defaultFormData = {
    position_name: '', 
    department_name: '', 
    supervisor_name: '', 
    description_date: new Date().toISOString().slice(0, 10),
    objective: '',
    degree_required: '', 
    complementary_training: '', 
    technical_knowledge: '', 
    experience_required: '',
    needs_recycling: false, 
    recycling_frequency: '', 
    recycling_knowledge: '',
    functions: '',
    tools_and_equipment: '',
    competencies: { flexibilidad: 3, responsabilidad: 3, iniciativa: 3, orientacion_resultados: 3, autoconfianza: 3 },
    annual_objectives: [],
    job_risks: {}
};

const JobProfileEditor = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(defaultFormData);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfileData = useCallback(async () => {
        try {
            // 1. Obtener datos del usuario (para el nombre)
            const usersRes = await apiClient.get('/users');
            const targetUser = usersRes.data.find(u => u.id == userId);
            if (!targetUser) throw new Error("Usuario no encontrado.");
            setUser(targetUser);

            // 2. Obtener la ficha de puesto
            const profileRes = await apiClient.get(`/job-profiles/for-user/${userId}`);
            
            if (profileRes.data) {
                // 3. Si existe, se cargan los datos guardados
                setFormData({
                    ...defaultFormData, // Asegura que todos los campos existan
                    ...profileRes.data, // Sobrescribe con los datos de la BD
                    description_date: profileRes.data.description_date ? profileRes.data.description_date.slice(0, 10) : defaultFormData.description_date,
                    competencies: profileRes.data.competencies || defaultFormData.competencies,
                    annual_objectives: profileRes.data.annual_objectives || [],
                    job_risks: profileRes.data.job_risks || {}
                });
            } else {
                // 4. Si no existe, se pre-rellenan datos desde el perfil de usuario
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

    // Manejador genérico para inputs simples
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Manejador para los editores de texto enriquecido
    const handleRichTextChange = (fieldName, content) => {
        setFormData(prev => ({ ...prev, [fieldName]: content }));
    };

    // Manejador para las barras de competencias
    const handleCompetencyChange = (id, value) => {
        setFormData(prev => ({
            ...prev,
            competencies: {
                ...prev.competencies,
                [id]: parseInt(value, 10)
            }
        }));
    };

    // --- Manejadores para Objetivos Dinámicos ---
    const handleObjectiveChange = (index, value) => {
        const newObjectives = [...formData.annual_objectives];
        newObjectives[index] = value;
        setFormData(prev => ({ ...prev, annual_objectives: newObjectives }));
    };

    const handleAddObjective = () => {
        setFormData(prev => ({ ...prev, annual_objectives: [...prev.annual_objectives, ''] }));
    };

    const handleRemoveObjective = (index) => {
        setFormData(prev => ({ ...prev, annual_objectives: formData.annual_objectives.filter((_, i) => i !== index) }));
    };
    
    // --- Manejador para la tabla de riesgos ---
    const handleRiskChange = (riskKey, field, value) => {
        setFormData(prev => ({
            ...prev,
            job_risks: {
                ...prev.job_risks,
                [riskKey]: {
                    ...(prev.job_risks[riskKey] || {}), // Mantiene los otros campos
                    [field]: value // Actualiza solo el campo cambiado
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            // El payload incluye todos los datos del formulario + el user_id
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
                
                {/* --- 1. IDENTIFICACIÓN --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">1. Identificación del Puesto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SimpleTextField label="Denominación" name="position_name" value={formData.position_name} onChange={handleChange} />
                        <SimpleTextField label="Departamento" name="department_name" value={formData.department_name} onChange={handleChange} />
                        <SimpleTextField label="Supervisor" name="supervisor_name" value={formData.supervisor_name} onChange={handleChange} />
                        <SimpleTextField label="Fecha" name="description_date" value={formData.description_date} onChange={handleChange} type="date" />
                    </div>
                </section>

                {/* --- 2. OBJETIVO --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">2. Descripción General - Objetivo</h2>
                    <RichTextField content={formData.objective} onUpdate={(c) => handleRichTextChange('objective', c)} className="min-h-[100px]" />
                </section>

                {/* --- 3. FORMACIÓN REQUERIDA --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">3. Formación Requerida</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                        <SimpleTextField label="Titulación" name="degree_required" value={formData.degree_required} onChange={handleChange} />
                        <SimpleTextField label="Experiencia Requerida" name="experience_required" value={formData.experience_required} onChange={handleChange} />
                        <SimpleTextField label="Formación Complementaria" name="complementary_training" value={formData.complementary_training} onChange={handleChange} type="textarea" />
                        <SimpleTextField label="Conocimientos Técnicos Específicos" name="technical_knowledge" value={formData.technical_knowledge} onChange={handleChange} type="textarea" />
                        
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            <div className="flex items-center pt-6">
                                <input type="checkbox" id="needs_recycling" name="needs_recycling" checked={formData.needs_recycling} onChange={handleChange} className="h-5 w-5 rounded text-macrosad-pink focus:ring-macrosad-pink" />
                                <label htmlFor="needs_recycling" className="ml-3 block text-sm font-semibold text-gray-600">Necesita Reciclaje</label>
                            </div>
                            <SimpleTextField label="Frecuencia" name="recycling_frequency" value={formData.recycling_frequency} onChange={handleChange} />
                            <SimpleTextField label="Conocimiento a Reciclar" name="recycling_knowledge" value={formData.recycling_knowledge} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                {/* --- 4. FUNCIONES --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">4. Funciones del Puesto</h2>
                     <RichTextField content={formData.functions} onUpdate={(c) => handleRichTextChange('functions', c)} className="min-h-[250px]" />
                </section>

                {/* --- 5. HERRAMIENTAS --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">5. Herramientas y Equipos</h2>
                     <RichTextField content={formData.tools_and_equipment} onUpdate={(c) => handleRichTextChange('tools_and_equipment', c)} className="min-h-[150px]" />
                </section>

                {/* --- 6. COMPETENCIAS --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">6. Competencias</h2>
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
                
                {/* --- 7. OBJETIVOS ANUALES (DINÁMICO) --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">7. Objetivos Anuales</h2>
                    <div className="space-y-4">
                        {formData.annual_objectives.map((objective, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-gray-600 shrink-0">Obj {index + 1}:</label>
                                <input
                                    type="text"
                                    placeholder="Describe el objetivo..."
                                    value={objective}
                                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                    className="w-full p-2 border rounded-md bg-gray-50"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveObjective(index)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                    title="Eliminar objetivo"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={handleAddObjective}
                            className="text-sm font-semibold text-macrosad-pink hover:underline flex items-center gap-1"
                        >
                            <FaPlus size={12} /> Añadir Objetivo
                        </button>
                    </div>
                </section>

                {/* --- 8. RIESGOS (TABLA) --- */}
                <section>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">8. Riesgos del Puesto</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border-b text-left text-sm font-semibold text-gray-600">Riesgo</th>
                                    <th className="p-2 border-b text-left text-sm font-semibold text-gray-600 w-32">Probabilidad</th>
                                    <th className="p-2 border-b text-left text-sm font-semibold text-gray-600 w-32">Consecuencias</th>
                                    <th className="p-2 border-b text-left text-sm font-semibold text-gray-600 w-32">Estimación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {JOB_RISKS_LIST.map((risk) => (
                                    <tr key={risk.key} className="hover:bg-gray-50">
                                        <td className="p-2 border-b border-gray-200 text-sm font-medium text-gray-700">{risk.label}</td>
                                        <td className="p-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                value={formData.job_risks[risk.key]?.prob || ''}
                                                onChange={(e) => handleRiskChange(risk.key, 'prob', e.target.value)}
                                                className="w-full p-1 border rounded-md bg-white"
                                            />
                                        </td>
                                        <td className="p-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                value={formData.job_risks[risk.key]?.cons || ''}
                                                onChange={(e) => handleRiskChange(risk.key, 'cons', e.target.value)}
                                                className="w-full p-1 border rounded-md bg-white"
                                            />
                                        </td>
                                        <td className="p-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                value={formData.job_risks[risk.key]?.est || ''}
                                                onChange={(e) => handleRiskChange(risk.key, 'est', e.target.value)}
                                                className="w-full p-1 border rounded-md bg-white"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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