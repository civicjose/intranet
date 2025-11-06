// client/src/pages/TeamMemberProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { FaSpinner, FaFilePdf } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';
import JobProfileViewer from '../components/JobProfileViewer'; // El visor web

// --- Imports para PDF ---
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JobProfilePrintable from '../components/JobProfilePrintable'; // El componente de impresión
import '../styles/PrintProfile.css'; // Los estilos para el PDF
// -------------------------

const TeamMemberProfilePage = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- State y Ref para PDF ---
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const printRef = useRef();
    // ----------------------------

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true); // Asegura que esté en modo carga
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

    // --- Función para generar y descargar el PDF ---
    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        setIsGeneratingPDF(true);

        const input = printRef.current;
        
        try {
            // 1. "Fotografiar" el componente React
            const canvas = await html2canvas(input, {
                scale: 2, // Aumenta la resolución
                useCORS: true, // Permite cargar imágenes (logo)
                logging: false,
                windowWidth: input.scrollWidth,
                windowHeight: input.scrollHeight
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // 2. Configurar el PDF en A4 (210mm x 297mm)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            // 3. Calcular la relación de aspecto para que la imagen quepa
            const ratio = canvasWidth / canvasHeight;
            const imgWidth = pdfWidth; // Usar todo el ancho
            const imgHeight = imgWidth / ratio;

            let heightLeft = imgHeight;
            let position = 0; // Posición Y inicial

            // 4. Añadir la primera página
            // (x, y, ancho, alto)
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // 5. Añadir páginas adicionales si el contenido se desborda
            while (heightLeft > 0) {
                position = -pdfHeight; // Mueve la "foto" hacia arriba
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            // 6. Descargar el archivo
            const fileName = `Ficha_Puesto_${user?.first_name}_${user?.last_name}.pdf`;
            pdf.save(fileName);

        } catch (err) {
            console.error("Error al generar el PDF:", err);
            setError("No se pudo generar el PDF.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };
    // ------------------------------------------

    if (loading) {
        return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>;
    }

    if (error) {
        return <ErrorMessage message={error} />;
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
                    
                    {/* --- Botón de Descarga --- */}
                    {profile && (
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGeneratingPDF ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                <FaFilePdf />
                            )}
                            {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                        </button>
                    )}
                </div>
            </header>

            {/* --- Visor web (El que se ve en la página) --- */}
            <JobProfileViewer profile={profile} />

            {/* --- Componente oculto para la impresión --- */}
            {/* Renderiza el componente de impresión fuera de la pantalla.
              Es invisible para el usuario, pero 'html2canvas' puede leerlo.
            */}
            <div style={{ position: 'fixed', left: '-2000px', top: 0, zIndex: -1 }}>
                <JobProfilePrintable profile={profile} ref={printRef} />
            </div>
        </div>
    );
};

export default TeamMemberProfilePage;