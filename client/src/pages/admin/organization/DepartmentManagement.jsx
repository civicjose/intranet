// client/src/pages/admin/organization/DepartmentManagement.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../../services/api";
import { MdEdit, MdDelete } from "react-icons/md";
import ConfirmationModal from "../../../components/admin/ConfirmationModal";
import ErrorMessage from "../../../components/ErrorMessage";
import DepartmentModal from "../../../components/admin/organization/DepartmentModal";

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
      const payload = { name: data.name, area_id: data.area_id || null };
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

      {/* --- VISTA DE TABLA PARA ESCRITORIO --- */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
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
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-text-dark">
                    {item.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.area_name || (
                    <span className="italic">Sin asignar</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <MdEdit size={22} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <MdDelete size={22} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VISTA DE TARJETAS PARA MÓVIL --- */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {departments.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <p className="font-semibold text-text-dark break-words">
                  {item.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.area_name || (
                    <span className="italic">Sin área asignada</span>
                  )}
                </p>
              </div>
              <div className="flex space-x-3 flex-shrink-0 ml-4">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <MdEdit size={22} />
                </button>
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="text-red-600 hover:text-red-900"
                >
                  <MdDelete size={22} />
                </button>
              </div>
            </div>
          </div>
        ))}
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