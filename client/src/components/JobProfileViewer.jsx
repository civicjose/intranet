// client/src/components/JobProfileViewer.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Componente para el texto enriquecido (ahora más genérico)
const RichTextViewer = ({ content }) => {
    if (!content || content === '<p></p>') return <p className="text-gray-500 italic text-sm">No especificado</p>;
    return <div className="job-profile-prose" dangerouslySetInnerHTML={{ __html: content }} />;
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


const JobProfileViewer = ({ profile }) => {
    if (!profile) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-700">Ficha de Puesto</h1>
                <p className="text-gray-500 mt-4">Aún no se ha generado una ficha de puesto para este perfil.</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* --- SECCIÓN DE IDENTIFICACIÓN --- */}
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
                    <InfoCard title="Objetivos Anuales" content={profile.annual_objectives} />
                </div>

                {/* Columna Derecha (más estrecha) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Requisitos</h3>
                        <div className="space-y-4">
                            <Field title="Titulación Requerida" content={profile.degree_required} />
                            <Field title="Experiencia Requerida" content={profile.experience_required} />
                            <Field title="Formación Complementaria" content={profile.complementary_training} />
                            <Field title="Conocimientos Técnicos" content={profile.technical_knowledge} />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Competencias Clave</h3>
                         <div className="space-y-4">
                            {profile.competencies && Object.entries(profile.competencies).map(([key, value]) => (
                                <CompetencyBar key={key} label={key} value={value} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Pequeño componente Field para los Requisitos (ya no es global)
const Field = ({ title, content }) => (
    <div>
        <h4 className="font-semibold text-gray-600 text-sm">{title}</h4>
        <RichTextViewer content={content} />
    </div>
);


export default JobProfileViewer;