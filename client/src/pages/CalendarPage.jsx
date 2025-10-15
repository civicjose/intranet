// client/src/pages/CalendarPage.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventModal from '../components/calendar/EventModal';
import ConfirmationModal from '../components/admin/ConfirmationModal'; // Reutilizamos el modal de confirmación
import '../styles/Calendar.css';

const CalendarPage = () => {
  const { user } = useAuth();
  const isAdmin = user.role_id === 1;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEventInfo, setSelectedEventInfo] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchEvents = () => {
    apiClient.get('/events').then(res => {
      const formattedEvents = res.data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_date,
        end: event.end_date,
        allDay: event.all_day,
        extendedProps: { description: event.description }
      }));
      setEvents(formattedEvents);
    }).catch(err => console.error("Error al cargar eventos:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDateClick = (arg) => {
    if (isAdmin) {
      setSelectedEventInfo({ start: arg.dateStr, allDay: true });
      setIsModalOpen(true);
    }
  };
  
  const handleEventClick = (arg) => {
    setSelectedEventInfo({
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.startStr,
      end: arg.event.endStr,
      allDay: arg.event.allDay,
      description: arg.event.extendedProps.description
    });
    setIsModalOpen(true);
  };
  
  const handleSave = async (eventData, eventId) => {
    if (eventId) { // Actualizar
      await apiClient.put(`/events/${eventId}`, eventData);
    } else { // Crear
      await apiClient.post('/events', eventData);
    }
    setIsModalOpen(false);
    fetchEvents();
  };

  const handleDelete = (eventToDelete) => {
    setSelectedEventInfo(eventToDelete);
    setIsModalOpen(false); // Cierra el modal de detalles
    setIsDeleteModalOpen(true); // Abre el de confirmación
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedEventInfo?.id) return;
    await apiClient.delete(`/events/${selectedEventInfo.id}`);
    setIsDeleteModalOpen(false);
    fetchEvents();
  };

  if (loading) return <div>Cargando calendario...</div>;

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center sm:text-left">Calendario de Eventos</h1>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView={isMobile ? 'dayGridDay' : 'dayGridMonth'}
          headerToolbar={isMobile ? { left: 'prev,next', center: 'title', right: 'today' } : { left: 'prev,next today', center: 'title', right: 'dayGridMonth' }}
          events={events}
          locale="es"
          buttonText={{ today: 'Hoy', month: 'Mes', day: 'Día' }}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          aspectRatio={2.2}
        />
      </div>

      {isModalOpen && (
        <EventModal 
          eventInfo={selectedEventInfo}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Confirmar Borrado"
          message={`¿Estás seguro de que quieres eliminar el evento "${selectedEventInfo?.title}"?`}
          onConfirm={handleConfirmDelete}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  );
};

export default CalendarPage;