import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";
import { MdEdit, MdDelete, MdPeople } from "react-icons/md";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import ErrorMessage from "../../components/ErrorMessage";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import ReportModal from "../../components/admin/ReportModal";

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, usersRes] = await Promise.all([
        apiClient.get("/reports"),
        apiClient.get("/users"),
      ]);
      setReports(reportsRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const clearError = () => setTimeout(() => setError(""), 5000);

  const handleOpenModal = async (report = null) => {
    if (report) {
      try {
        const { data } = await apiClient.get(`/reports/${report.id}`);
        const fullReportData = {
          ...report,
          ...data,
          assigned_users: data.assigned_users_ids,
        };
        setSelectedReport(fullReportData);
      } catch (err) {
        setError("No se pudieron cargar los detalles del informe.");
        return;
      }
    } else {
      setSelectedReport(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedReport(null);
  };

  const handleSave = async (reportData) => {
    try {
      if (selectedReport) {
        await apiClient.put(`/reports/${selectedReport.id}`, reportData);
      } else {
        await apiClient.post("/reports", reportData);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteClick = (report) => {
    setSelectedReport(report);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReport) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`/reports/${selectedReport.id}`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo borrar el informe.");
      clearError();
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Cargando informes...</div>;

  return (
    <>
      <AdminPageLayout
        title="Gestión de Informes"
        subtitle="Añade, edita o elimina informes de Power BI."
        buttonLabel="+ Añadir Informe"
        onButtonClick={() => handleOpenModal()}
      >
        {error && (
          <div className="p-4 border-b">
            <ErrorMessage message={error} />
          </div>
        )}
        <ul className="divide-y divide-gray-200">
          {reports.map((report) => (
            <li
              key={report.id}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{report.title}</p>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <MdPeople className="mr-1" />{" "}
                  {report.assigned_users?.length || 0} usuarios asignados
                </div>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => handleOpenModal(report)}
                  className="text-indigo-600"
                >
                  <MdEdit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteClick(report)}
                  className="text-red-600"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </AdminPageLayout>

      {isModalOpen && (
        <ReportModal
          report={selectedReport}
          allUsers={allUsers}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Confirmar Borrado"
          message={`¿Eliminar el informe "${selectedReport?.title}"?`}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseModal}
          isLoading={isSaving}
        />
      )}
    </>
  );
};

export default AdminReportsPage;
