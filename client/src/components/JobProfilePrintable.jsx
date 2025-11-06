// client/src/components/JobProfilePrintable.jsx
import React from 'react';

// --- Listas Fijas (Iguales que en el editor) ---
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

const COMPETENCIES = [
    { id: 'flexibilidad', label: 'Flexibilidad / Adaptabilidad' },
    { id: 'responsabilidad', label: 'Responsabilidad' },
    { id: 'iniciativa', label: 'Iniciativa' },
    { id: 'orientacion_resultados', label: 'Orientación a Resultados' },
    { id: 'autoconfianza', label: 'Autoconfianza' },
];
// --- Fin de Listas Fijas ---

// Componente para renderizar HTML o texto simple
const PrintContentView = ({ content }) => {
    if (!content) return <span></span>;
    // Si es HTML, lo renderiza
    if (content.includes('<p>') || content.includes('<ul>') || content.includes('<ol>')) {
         return <div className="print-content" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    // Si es texto simple con saltos de línea (de textarea), lo formatea
    if (content.includes('\n')) {
        return (
            <div className="print-content">
                {content.split('\n').map((line, index) => (
                    <span key={index}>
                        {line}
                        <br />
                    </span>
                ))}
            </div>
        );
    }
    // Si es texto simple
    return <span className="print-content">{content}</span>;
};

// Componente de fila reutilizable
const TableRow = ({ label, content, labelClass = "label-col" }) => (
    <tr>
        <td className={labelClass}><PrintContentView content={label} /></td>
        <td><PrintContentView content={content} /></td>
    </tr>
);

// Componente de fila de 1 celda
const FullWidthRow = ({ content }) => (
    <tr>
        <td className="full-col"><PrintContentView content={content} /></td>
    </tr>
);


const JobProfilePrintable = React.forwardRef(({ profile }, ref) => {
    if (!profile) return null;
    
    // Mapea los niveles de competencias para la tabla
    const competencyMap = profile.competencies || {};

    return (
        <div ref={ref} className="a4-sheet">
            
            {/* --- Título Principal --- */}
            <p className="print-main-title">ANÁLISIS Y DESCRIPCIÓN DE PUESTO</p>

            {/* --- 1. IDENTIFICACIÓN --- */}
            <div className="print-section-title pink">IDENTIFICACIÓN DEL PUESTO</div>
            <table className="print-table">
                <tbody>
                    <TableRow label="DENOMINACIÓN DEL PUESTO" content={profile.position_name} labelClass="label-col" />
                    <TableRow label="DEPARTAMENTO" content={profile.department_name} labelClass="label-col" />
                    <TableRow label="PUESTO SUPERVISOR" content={profile.supervisor_name} labelClass="label-col" />
                    <TableRow label="FECHA" content={new Date(profile.description_date).toLocaleDateString('es-ES')} labelClass="label-col" />
                </tbody>
            </table>

            {/* --- 2. DESCRIPCIÓN GENERAL --- */}
            <div className="print-section-title pink">DESCRIPCIÓN GENERAL - OBJETIVO DEL PUESTO -</div>
            <table className="print-table">
                <tbody>
                    <FullWidthRow content={profile.objective} />
                </tbody>
            </table>

            {/* --- 3. FORMACIÓN REQUERIDA --- */}
            <div className="print-section-title pink">FORMACIÓN REQUERIDA</div>
            <table className="print-table">
                <tbody>
                    <TableRow label="TITULACIÓN" content={profile.degree_required} labelClass="label-col-light" />
                    <TableRow label="FORMACIÓN COMPLEMENTARIA" content={profile.complementary_training} labelClass="label-col-light" />
                    <TableRow label="CONOCIMIENTOS TÉCNICOS ESPECÍFICOS" content={profile.technical_knowledge} labelClass="label-col-light" />
                    <TableRow label="EXPERIENCIA REQUERIDA" content={profile.experience_required} labelClass="label-col-light" />
                    <TableRow 
                        label="NECESITA RECICLAJE"
                        content={
                            (profile.needs_recycling ? 'SÍ' : 'NO') +
                            (profile.needs_recycling ? 
                                `\n\nFRECUENCIA: ${profile.recycling_frequency || ''}\n\nCONOCIMIENTO A RECICLAR: ${profile.recycling_knowledge || ''}` 
                                : '')
                        }
                        labelClass="label-col-light"
                    />
                </tbody>
            </table>

             {/* --- 4. FUNCIONES --- */}
             <div className="print-section-title fuchsia">FUNCIONES DEL PUESTO</div>
            <table className="print-table">
                <tbody>
                    <FullWidthRow content={profile.functions} />
                </tbody>
            </table>

             {/* --- 5. HERRAMIENTAS --- */}
             <div className="print-section-title fuchsia">HERRAMIENTAS Y EQUIPOS</div>
            <table className="print-table">
                <tbody>
                    <FullWidthRow content={profile.tools_and_equipment} />
                </tbody>
            </table>

            {/* --- 6. COMPETENCIAS --- */}
            <div className="print-section-title fuchsia">COMPETENCIAS</div>
            <table className="print-table">
                <thead>
                    <tr>
                        <th className="competency-header">Definir el nivel necesario de cada una de las competencias para el puesto</th>
                        <th className="competency-level">1</th>
                        <th className="competency-level">2</th>
                        <th className="competency-level">3</th>
                        <th className="competency-level">4</th>
                        <th className="competency-level">5</th>
                    </tr>
                </thead>
                <tbody>
                    {COMPETENCIES.map(comp => {
                        const value = competencyMap[comp.id];
                        return (
                            <tr key={comp.id}>
                                <td className="competency-label">{comp.label}</td>
                                <td className="competency-value">{value == 1 ? 'X' : ''}</td>
                                <td className="competency-value">{value == 2 ? 'X' : ''}</td>
                                <td className="competency-value">{value == 3 ? 'X' : ''}</td>
                                <td className="competency-value">{value == 4 ? 'X' : ''}</td>
                                <td className="competency-value">{value == 5 ? 'X' : ''}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* --- 7. OBJETIVOS ANUALES --- */}
            <div className="print-section-title fuchsia">OBJETIVOS ANUALES DEL PUESTO</div>
            <table className="print-table">
                <tbody>
                    {profile.annual_objectives && profile.annual_objectives.length > 0 ? (
                        profile.annual_objectives.map((obj, index) => (
                           obj && <TableRow key={index} label={`OBJETIVO ${index + 1}`} content={obj} labelClass="label-col-light" />
                        ))
                    ) : (
                        <tr><td className="full-col" style={{textAlign: 'center', fontStyle: 'italic'}}>No se han definido objetivos anuales.</td></tr>
                    )}
                </tbody>
            </table>

            {/* --- 8. RIESGOS --- */}
            <div className="print-section-title fuchsia">RIESGOS DEL PUESTO DE TRABAJO</div>
            <table className="print-table">
                <thead>
                    <tr>
                        <th className="risk-header">RIESGO</th>
                        <th className="risk-header">Probabilidad</th>
                        <th className="risk-header">Consecuencias</th>
                        <th className="risk-header">Estimación</th>
                    </tr>
                </thead>
                <tbody>
                    {JOB_RISKS_LIST.map((risk) => {
                        const riskData = profile.job_risks[risk.key] || {};
                        return (
                            <tr key={risk.key}>
                                <td className="risk-label">{risk.label}</td>
                                <td className="risk-value">{riskData.prob || '—'}</td>
                                <td className="risk-value">{riskData.cons || '—'}</td>
                                <td className="risk-value">{riskData.est || '—'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
});

export default JobProfilePrintable;