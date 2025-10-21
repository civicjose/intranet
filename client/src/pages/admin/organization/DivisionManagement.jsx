// client/src/pages/admin/organization/DivisionManagement.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../../services/api";
import { MdEdit, MdDelete, MdDragIndicator } from "react-icons/md";
import ConfirmationModal from "../../../components/admin/ConfirmationModal";
import ErrorMessage from "../../../components/ErrorMessage";
import DivisionModal from "../../../components/admin/organization/DivisionModal";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableDivisionRow = ({ division, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: division.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <tr ref={setNodeRef} style={style} {...attributes}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <button {...listeners} className="cursor-grab text-gray-400 mr-4 p-2">
                        <MdDragIndicator size={20} />
                    </button>
                    <span className="font-semibold text-text-dark">{division.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <button onClick={() => onEdit(division)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={22} /></button>
                <button onClick={() => onDelete(division)} className="text-red-600 hover:text-red-900"><MdDelete size={22} /></button>
            </td>
        </tr>
    );
};

const DivisionManagement = () => {
  const [divisions, setDivisions] = useState([]);
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
          const { data } = await apiClient.get("/divisions");
          setDivisions(data);
      } catch (err) {
          setError("No se pudo cargar la lista de divisiones.");
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
  
  const handleDeleteClick = (item) => {
      setSelectedItem(item);
      setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
      if (!selectedItem) return;
      setIsSaving(true);
      try {
          await apiClient.delete(`/divisions/${selectedItem.id}`);
          handleCloseModal();
          fetchData();
      } catch (err) {
          setError(err.response?.data?.message || "No se pudo borrar la división.");
          handleCloseModal();
      } finally {
          setIsSaving(false);
      }
  };

  const handleSave = async (data) => {
      try {
          // El payload ya no necesita order_index
          const payload = { name: data.name };
          if (data.id) {
              await apiClient.put(`/divisions/${data.id}`, payload);
          } else {
              await apiClient.post("/divisions", payload);
          }
          handleCloseModal();
          fetchData();
      } catch (err) { throw err; }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
          const oldIndex = divisions.findIndex((d) => d.id === active.id);
          const newIndex = divisions.findIndex((d) => d.id === over.id);
          const newOrder = arrayMove(divisions, oldIndex, newIndex);
          setDivisions(newOrder);

          try {
              const orderedIds = newOrder.map(d => d.id);
              await apiClient.put('/divisions/reorder', { orderedIds });
          } catch (err) {
              setError("No se pudo guardar el nuevo orden. Por favor, recarga la página.");
              fetchData(); 
          }
      }
  };
  
  if (loading) return <div>Cargando divisiones...</div>;

  return (
      <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <h3 className="text-xl font-semibold text-gray-700">Listado de Divisiones</h3>
              <button onClick={() => handleOpenModal()} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
                  + Añadir División
              </button>
          </div>

          {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                              <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                          </tr>
                      </thead>
                      <SortableContext items={divisions.map(d => d.id)} strategy={verticalListSortingStrategy}>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {divisions.map((item) => (
                                  <DraggableDivisionRow key={item.id} division={item} onEdit={handleOpenModal} onDelete={handleDeleteClick} />
                              ))}
                          </tbody>
                      </SortableContext>
                  </table>
              </DndContext>
          </div>

          {isModalOpen && <DivisionModal division={selectedItem} onSave={handleSave} onClose={handleCloseModal} />}
          {isDeleteModalOpen && <ConfirmationModal title="Confirmar Borrado" message={`¿Eliminar la división "${selectedItem?.name}"?`} onConfirm={handleConfirmDelete} onClose={handleCloseModal} isLoading={isSaving} />}
      </div>
  );
};

export default DivisionManagement;