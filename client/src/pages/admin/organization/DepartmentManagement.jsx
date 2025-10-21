// client/src/pages/admin/organization/DepartmentManagement.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../../services/api";
import { MdEdit, MdDelete, MdDragIndicator } from "react-icons/md";
import ConfirmationModal from "../../../components/admin/ConfirmationModal";
import ErrorMessage from "../../../components/ErrorMessage";
import DepartmentModal from "../../../components/admin/organization/DepartmentModal";
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
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.area_name || <span className="italic">Sin asignar</span>}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <button onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={22} /></button>
                <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900"><MdDelete size={22} /></button>
            </td>
        </tr>
    );
};

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [areas, setAreas] = useState([]);
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
      const [departmentsRes, areasRes] = await Promise.all([
        apiClient.get("/departments"),
        apiClient.get("/areas"),
      ]);
      setDepartments(departmentsRes.data);
      setAreas(areasRes.data);
    } catch (err) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      const payload = { 
        name: data.name, 
        area_id: data.area_id || null, 
      };
      if (data.id) {
        await apiClient.put(`/departments/${data.id}`, payload);
      } else {
        await apiClient.post("/departments", payload);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`/departments/${selectedItem.id}`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo borrar el departamento."
      );
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = async (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
          const oldIndex = departments.findIndex((d) => d.id === active.id);
          const newIndex = departments.findIndex((d) => d.id === over.id);
          const newOrder = arrayMove(departments, oldIndex, newIndex);
          setDepartments(newOrder);
          try {
              const orderedIds = newOrder.map(d => d.id);
              await apiClient.put('/departments/reorder', { orderedIds });
          } catch (err) {
              setError("No se pudo guardar el nuevo orden.");
              fetchData();
          }
      }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-700">
          Listado de Departamentos
        </h3>
        <button
          onClick={() => handleOpenModal()}
          className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-transform active:scale-95 w-full sm:w-auto"
        >
          + Añadir Departamento
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
                <SortableContext items={departments.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {departments.map((item) => (
                        <DraggableRow key={item.id} item={item} onEdit={handleOpenModal} onDelete={handleDeleteClick} />
                        ))}
                    </tbody>
                </SortableContext>
            </table>
        </DndContext>
      </div>

      {isModalOpen && (
        <DepartmentModal
          department={selectedItem}
          areas={areas}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Confirmar Borrado"
          message={`¿Eliminar el departamento "${selectedItem?.name}"?`}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseModal}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default DepartmentManagement;