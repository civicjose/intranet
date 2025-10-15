// client/src/pages/TicketsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/api';
import { FaSpinner, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import TicketDetailModal from '../components/tickets/TicketDetailModal';

const statusMap = {
  1: { text: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
  2: { text: 'En curso (Asignado)', color: 'bg-yellow-100 text-yellow-800' },
  3: { text: 'En curso (Planificado)', color: 'bg-yellow-100 text-yellow-800' },
  4: { text: 'Pendiente', color: 'bg-orange-100 text-orange-800' },
  5: { text: 'Solucionado', color: 'bg-green-100 text-green-800' },
  6: { text: 'Cerrado', color: 'bg-gray-100 text-gray-800' },
};

const SortableHeader = ({ children, name, sortConfig, requestSort }) => {
  const isSorted = sortConfig.key === name;
  const icon = isSorted ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />;

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => requestSort(name)}
    >
      <div className="flex items-center gap-2">
        {children}
        <span className="text-gray-400">{icon}</span>
      </div>
    </th>
  );
};


const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const fetchTickets = () => {
    setLoading(true);
    apiClient.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error("Error al cargar los tickets:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);
  
  const handleTicketCreated = () => {
    setIsCreateModalOpen(false);
    fetchTickets();
  };
  
  const sortedTickets = useMemo(() => {
    let sortableItems = [...tickets];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [tickets, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (loading && tickets.length === 0) {
    return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-macrosad-pink"/></div>;
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Tickets</h1>
            <p className="text-gray-500 mt-1">Aquí puedes ver el estado de tus solicitudes.</p>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
            + Crear Nuevo Ticket
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader name="id" sortConfig={sortConfig} requestSort={requestSort}>ID</SortableHeader>
                <SortableHeader name="name" sortConfig={sortConfig} requestSort={requestSort}>Título</SortableHeader>
                <SortableHeader name="date_creation" sortConfig={sortConfig} requestSort={requestSort}>Fecha Creación</SortableHeader>
                <SortableHeader name="status" sortConfig={sortConfig} requestSort={requestSort}>Estado</SortableHeader>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedTickets.length > 0 ? sortedTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">#{ticket.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{ticket.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(ticket.date_creation).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusMap[ticket.status]?.color || 'bg-gray-200'}`}>
                      {statusMap[ticket.status]?.text || 'Desconocido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedTicketId(ticket.id)} 
                      className="bg-macrosad-purple/10 text-macrosad-purple font-semibold py-1 px-3 rounded-md hover:bg-macrosad-purple/20 transition-colors text-sm"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">No tienes tickets abiertos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isCreateModalOpen && <CreateTicketModal onClose={() => setIsCreateModalOpen(false)} onTicketCreated={handleTicketCreated} />}
      {selectedTicketId && <TicketDetailModal ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />}
    </>
  );
};

export default TicketsPage;