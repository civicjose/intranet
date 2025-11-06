// client/src/components/JobProfileViewer.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Componente para el texto (maneja HTML y texto simple)
const RichTextViewer = ({ content }) => {
    // Si el contenido es HTML (contiene etiquetas), lo renderiza como HTML
    if (content && (content.includes('<p>') || content.includes('<ul>') || content.includes('<ol>'))) {
         return <div className="job-profile-prose" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    // Si es texto simple (o nulo), lo envuelve en un <p>
    return <p className={`job-profile-prose ${!content ? 'text-gray-500 italic' : ''}`}>{content || 'No especificado'}</p>;
};

// Tarjeta para mostrar información clave
const InfoCard = ({ title, content }) => (
    <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
        <div className="mt-2">
            <RichTextViewer content={content} />
        </div>
    </div>
);

// Barra de progreso para las competencias
const CompetencyBar = ({ label, value }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium capitalize text-gray-700">{label.replace(/_/g, ' ')}</span>
            <span className="text-sm font-bold text-macrosad-purple">{value} / 5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-macrosad-pink h-2 rounded-full" style={{ width: `${(value / 5) * 100}%` }}></div>
        </div>
    </div>
);

// Lista fija de riesgos (debe ser idéntica a la del editor)
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

// Componente principal del visor
const JobProfileViewer = ({ profile }) => {
    if (!profile) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-700">Ficha de Puesto</h1>
                <p className="text-gray-500 mt-4">Aún no se ha generado una ficha de puesto para este perfil.</p>
            </div>
        );
    }

    // Comprobaciones para mostrar/ocultar secciones
    const hasTrainingInfo = profile.degree_required || profile.experience_required || profile.complementary_training || profile.technical_knowledge;
    const hasRecyclingInfo = profile.needs_recycling || profile.recycling_frequency || profile.recycling_knowledge;
    const hasObjectives = profile.annual_objectives && profile.annual_objectives.length > 0;
    const hasRisks = profile.job_risks && Object.keys(profile.job_risks).length > 0;

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* --- 1. IDENTIFICACIÓN --- */}
            <section className="bg-white p-6 rounded-xl shadow-md border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Identificación del Puesto</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div><p className="font-semibold text-gray-500">Denominación</p><p className="text-gray-900 font-medium">{profile.position_name}</p></div>
                    <div><p className="font-semibold text-gray-500">Departamento</p><p className="text-gray-900 font-medium">{profile.department_name}</p></div>
                    <div><p className="font-semibold text-gray-500">Supervisor/a</p><p className="text-gray-900 font-medium">{profile.supervisor_name}</p></div>
                    <div><p className="font-semibold text-gray-500">Fecha</p><p className="text-gray-900 font-medium">{new Date(profile.description_date).toLocaleDateString('es-ES')}</p></div>
                </div>
            </section>

            {/* --- LAYOUT PRINCIPAL DE DOS COLUMNAS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Columna Izquierda (más ancha) */}
                <div className="lg:col-span-3 space-y-6">
                    <InfoCard title="Objetivo General del Puesto" content={profile.objective} />
                    <InfoCard title="Funciones y Responsabilidades" content={profile.functions} />
                    <InfoCard title="Herramientas y Equipos" content={profile.tools_and_equipment} />
                    
                    {/* --- SECCIÓN DE OBJETIVOS (DINÁMICA) --- */}
                    {hasObjectives && (
                        <div className="bg-white p-4 rounded-lg border">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Objetivos Anuales</h3>
                            <ol className="job-profile-prose list-decimal pl-5 space-y-2">
                                {profile.annual_objectives.map((objective, index) => (
                                    // Muestra solo objetivos que no estén vacíos
                                    objective && <li key={index} className="pl-2">{objective}</li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* --- SECCIÓN DE RIESGOS (TABLA) --- */}
                    {hasRisks && (
                        <div className="bg-white p-4 rounded-lg border">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Riesgos del Puesto de Trabajo</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 border text-left text-xs font-semibold text-gray-600">Riesgo</th>
                                            <th className="p-2 border text-left text-xs font-semibold text-gray-600">Probabilidad</th>
                                            <th className="p-2 border text-left text-xs font-semibold text-gray-600">Consecuencias</th>
                                            <th className="p-2 border text-left text-xs font-semibold text-gray-600">Estimación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {JOB_RISKS_LIST.map((risk) => {
                                            const riskData = profile.job_risks[risk.key] || {};
                                            // Solo muestra la fila si tiene datos
                                            if (riskData.prob || riskData.cons || riskData.est) {
                                                return (
                                                    <tr key={risk.key} className="job-profile-prose">
                                                        <td className="p-2 border text-sm font-medium text-gray-700">{risk.label}</td>
                                                        <td className="p-2 border text-sm text-center">{riskData.prob || '—'}</td>
                                                        <td className="p-2 border text-sm text-center">{riskData.cons || '—'}</td>
                                                        <td className="p-2 border text-sm text-center">{riskData.est || '—'}</td>
                                                    </tr>
                                                );
                                            }
                                            return null;
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna Derecha (más estrecha) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Tarjeta de Formación Requerida */}
                    {hasTrainingInfo && (
                        <div className="bg-white p-4 rounded-lg border">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Requisitos del Puesto</h3>
                            <div className="space-y-4">
                                <Field title="Titulación Requerida" content={profile.degree_required} />
                                <Field title="Experiencia Requerida" content={profile.experience_required} />
                                <Field title="Formación Complementaria" content={profile.complementary_training} />
                                <Field title="Conocimientos Técnicos" content={profile.technical_knowledge} />
                            </div>
                        </div>
                    )}

                    {/* Tarjeta de Reciclaje */}
                    {hasRecyclingInfo && (
                         <div className="bg-white p-4 rounded-lg border">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Reciclaje</h3>
                            <div className="space-y-4">
                                <Field title="Necesita Reciclaje" content={profile.needs_recycling ? 'Sí' : 'No'} />
                                <Field title="Frecuencia" content={profile.recycling_frequency} />
                                <Field title="Conocimiento a Reciclar" content={profile.recycling_knowledge} />
                            </div>
                        </div>
                    )}

                    {/* Tarjeta de Competencias */}
                    {profile.competencies && (
                        <div className="bg-white p-4 rounded-lg border">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Competencias Clave</h3>
                            <div className="space-y-4">
                                {Object.entries(profile.competencies).map(([key, value]) => (
                                    <CompetencyBar key={key} label={key} value={value} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Componente auxiliar para mostrar campos de texto (simple o HTML)
const Field = ({ title, content }) => (
    <div>
        <h4 className="font-semibold text-gray-600 text-sm">{title}</h4>
        <RichTextViewer content={content} />
    </div>
);

export default JobProfileViewer;