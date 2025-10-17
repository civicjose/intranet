import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/api";
import { MdEdit, MdDelete } from "react-icons/md";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import ErrorMessage from "../../components/ErrorMessage";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import DepartmentModal from "../../components/admin/CategoryModal";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/categories");
      setCategories(data);
    } catch (err) {
      setError("No se pudo cargar la lista de categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const clearError = () => setTimeout(() => setError(""), 5000);

  const handleOpenModal = (cat = null) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSave = async (categoryData) => {
    try {
      if (categoryData.id) {
        await apiClient.put(`/categories/${categoryData.id}`, {
          name: categoryData.name,
        });
      } else {
        await apiClient.post("/categories", { name: categoryData.name });
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      throw err; // El modal se encarga de mostrar este error
    }
  };

  const handleDeleteClick = (cat) => {
    setSelectedCategory(cat);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`/categories/${selectedCategory.id}`);
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo borrar la categoría."
      );
      clearError();
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Cargando categorías...</div>;

  return (
    <>
      <AdminPageLayout
        title="Gestión de Categorías"
        subtitle="Añade, edita o elimina las categorías para las noticias."
        buttonLabel="+ Nueva Categoría"
        onButtonClick={() => handleOpenModal()}
        secondaryButtonLabel="&larr; Volver a Noticias"
        onSecondaryButtonClick={() => window.history.back()}
      >
        {error && (
          <div className="p-4 border-b">
            <ErrorMessage message={error} />
          </div>
        )}

        <ul className="divide-y divide-gray-200">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="p-4 flex justify-between items-center hover:bg-light-bg"
            >
              <span className="font-semibold text-text-dark">{cat.name}</span>
              <div className="space-x-4">
                <button
                  onClick={() => handleOpenModal(cat)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <MdEdit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteClick(cat)}
                  className="text-red-600 hover:text-red-900"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </AdminPageLayout>

      {isModalOpen && (
        <DepartmentModal
          department={selectedCategory}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Confirmar Borrado"
          message={`¿Estás seguro de que quieres eliminar la categoría "${selectedCategory?.name}"?`}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseModal}
          isLoading={isSaving}
        />
      )}
    </>
  );
};

export default CategoryManagementPage;
