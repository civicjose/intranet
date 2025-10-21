// client/src/pages/admin/organization/LocationManagement.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../../services/api";
import { MdEdit, MdDelete, MdDragIndicator } from "react-icons/md";
import ConfirmationModal from "../../../components/admin/ConfirmationModal";
import ErrorMessage from "../../../components/ErrorMessage";
import LocationModal from "../../../components/admin/organization/LocationModal";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableRow = ({ item, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <tr ref={setNodeRef} style={style} {...attributes}>
            <td className="px-6 py-4 whitespace-nowrap">
                 <div className="flex items-center">
                    <button {...listeners} className="cursor-grab text-gray-400 mr-4 p-2"><MdDragIndicator size={20} /></button>
                    <span className="font-semibold text-text-dark">{item.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                item.type === 'sede' 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-teal-100 text-teal-800'
                }`}>
                {item.type}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.city}, {item.province}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={22} /></button>
                <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900"><MdDelete size={22} /></button>
            </td>
        </tr>
    );
};

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await apiClient.get("/locations");
      setLocations(data);
    } catch (err) {
      setError("No se pudo cargar la lista de ubicaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await apiClient.put(`/locations/${data.id}`, data);
      } else {
        await apiClient.post("/locations", data);
      }
      handleCloseModal();
      fetchData();
    } catch (err) { throw err; }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`/locations/${selectedItem.id}`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo borrar la ubicación.");
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };
  
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = async (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
          const oldIndex = locations.findIndex((l) => l.id === active.id);
          const newIndex = locations.findIndex((l) => l.id === over.id);
          const newOrder = arrayMove(locations, oldIndex, newIndex);
          setLocations(newOrder);
          try {
              const orderedIds = newOrder.map(l => l.id);
              await apiClient.put('/locations/reorder', { orderedIds });
          } catch (err) {
              setError("No se pudo guardar el nuevo orden.");
              fetchData();
          }
      }
  };
  
  if (loading) return <div>Cargando ubicaciones...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-700">Listado de Ubicaciones</h3>
        <button onClick={() => handleOpenModal()} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-transform active:scale-95 w-full sm:w-auto">
          + Añadir Ubicación
        </button>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localidad</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
                <SortableContext items={locations.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {locations.map((item) => (
                            <DraggableRow key={item.id} item={item} onEdit={handleOpenModal} onDelete={handleDeleteClick} />
                        ))}
                    </tbody>
                </SortableContext>
            </table>
        </DndContext>
      </div>

      {isModalOpen && <LocationModal location={selectedItem} onSave={handleSave} onClose={handleCloseModal} />}
      {isDeleteModalOpen && <ConfirmationModal title="Confirmar Borrado" message={`¿Eliminar la ubicación "${selectedItem?.name}"?`} onConfirm={handleConfirmDelete} onClose={handleCloseModal} isLoading={isSaving} />}
    </div>
  );
};

export default LocationManagement;