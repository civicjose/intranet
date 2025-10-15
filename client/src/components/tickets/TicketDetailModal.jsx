// client/src/components/tickets/TicketDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import apiClient from '../../services/api';

const statusMap = {
  1: { text: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
  2: { text: 'En curso (Asignado)', color: 'bg-yellow-100 text-yellow-800' },
  3: { text: 'En curso (Planificado)', color: 'bg-yellow-100 text-yellow-800' },
  4: { text: 'Pendiente', color: 'bg-orange-100 text-orange-800' },
  5: { text: 'Solucionado', color: 'bg-green-100 text-green-800' },
  6: { text: 'Cerrado', color: 'bg-gray-100 text-gray-800' },
};

const TicketDetailModal = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ticketId) {
      apiClient.get(`/tickets/${ticketId}`)
        .then(res => setTicket(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [ticketId]);

  // --- FUNCIÓN CLAVE PARA DECODIFICAR HTML ---
  // Crea un elemento temporal para que el navegador decodifique los caracteres especiales.
  const decodeHtml = (html) => {
    if (!html) return '';
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
          {loading ? <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div> : (
            <h2 className="text-xl font-bold text-gray-800 truncate">
              Ticket #{ticket?.details?.id}: {ticket?.details?.name}
            </h2>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><MdClose size={24} /></button>
        </header>

        {loading ? (
          <div className="flex-grow flex justify-center items-center"><FaSpinner className="animate-spin text-4xl text-macrosad-pink" /></div>
        ) : (
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <p className={`text-lg font-bold ${statusMap[ticket.details.status]?.color.replace('bg-', 'text-').split(' ')[0]}`}>{statusMap[ticket.details.status]?.text || 'Desconocido'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                <p className="text-lg font-bold text-gray-800">{new Date(ticket.details.date_creation).toLocaleString('es-ES')}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Seguimiento</h3>
              <div className="space-y-4">
                {/* Primer mensaje (el contenido original del ticket) */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-sm font-semibold text-blue-800">Tu solicitud inicial</p>
                  <div 
                    className="text-gray-700 mt-1 prose prose-sm max-w-none" 
                    dangerouslySetInnerHTML={{ __html: decodeHtml(ticket.details.content) }} 
                  />
                  <p className="text-xs text-gray-500 mt-2 text-right">{new Date(ticket.details.date_creation).toLocaleString('es-ES')}</p>
                </div>
                {/* Resto de seguimientos */}
                {ticket.followups.map(followup => (
                  <div key={followup.id} className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">Respuesta del equipo de soporte</p>
                    <div 
                      className="text-gray-700 mt-1 prose prose-sm max-w-none" 
                      dangerouslySetInnerHTML={{ __html: decodeHtml(followup.content) }} 
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right">{new Date(followup.date_creation).toLocaleString('es-ES')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailModal;