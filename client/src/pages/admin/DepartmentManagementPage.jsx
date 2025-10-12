import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { MdEdit, MdDelete } from "react-icons/md";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import DepartmentModal from "../../components/admin/DepartmentModal";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import ErrorMessage from "../../components/ErrorMessage";

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/departments");
      setDepartments(data);
    } catch (err) {
      setError("No se pudo cargar la lista de departamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
  const clearError = () => setTimeout(() => setError(""), 5000);

  const handleOpenModal = (dept = null) => {
    setSelectedDept(dept);
    setIsDeptModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsDeptModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedDept(null);
  };
  const handleDeleteClick = (dept) => {
    setSelectedDept(dept);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (deptData) => {
    try {
      if (deptData.id) {
        await apiClient.put(`/departments/${deptData.id}`, {
          name: deptData.name,
        });
      } else {
        await apiClient.post("/departments", { name: deptData.name });
      }
      handleCloseModal();
      fetchDepartments();
    } catch (err) {
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDept) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`/departments/${selectedDept.id}`);
      handleCloseModal();
      fetchDepartments();
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo borrar el departamento."
      );
      clearError();
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Cargando departamentos...</div>;

  return (
    <>
      <AdminPageLayout
        title="Gestión de Departamentos"
        subtitle="Añade, edita o elimina los departamentos de la empresa."
        buttonLabel="+ Añadir Departamento"
        onButtonClick={() => handleOpenModal()}
      >
        {error && (
          <div className="p-4 border-b">
            <ErrorMessage message={error} />
          </div>
        )}
        <ul className="divide-y divide-gray-200">
          {departments.map((dept) => (
            <li
              key={dept.id}
              className="p-4 flex justify-between items-center hover:bg-light-bg"
            >
              <span className="font-semibold text-text-dark">{dept.name}</span>
              <div className="space-x-4">
                <button
                  onClick={() => handleOpenModal(dept)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <MdEdit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteClick(dept)}
                  className="text-red-600 hover:text-red-900"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </AdminPageLayout>

      {isDeptModalOpen && (
        <DepartmentModal
          department={selectedDept}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Confirmar Borrado"
          message={`¿Eliminar el departamento "${selectedDept?.name}"?`}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseModal}
          isLoading={isSaving}
        />
      )}
    </>
  );
};

export default DepartmentManagementPage;
