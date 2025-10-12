import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importa Link
import apiClient from "../../services/api";
import { MdEdit, MdDelete } from "react-icons/md";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import ErrorMessage from "../../components/ErrorMessage";

function NewsManagementPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/news");
      setNews(data);
    } catch (err) {
      setError("No se pudo cargar la lista de noticias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDeleteClick = (article) => {
    setSelectedArticle(article);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedArticle) return;
    try {
      await apiClient.delete(`/news/${selectedArticle.id}`);
      setIsDeleteModalOpen(false);
      fetchNews();
    } catch (err) {
      setError("No se pudo eliminar la noticia.");
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <div>Cargando noticias...</div>;

  return (
    <>
      <AdminPageLayout
        title="Gestión de Noticias"
        subtitle="Crea, edita y publica comunicados internos."
        buttonLabel="+ Nueva Noticia"
        onButtonClick={() => navigate("/admin/news/new")}
        // --- CORRECCIÓN AQUÍ: Añadimos el botón secundario ---
        secondaryButtonLabel="Gestionar Categorías"
        onSecondaryButtonClick={() => navigate("/admin/news/categories")}
      >
        {error && (
          <div className="p-4 border-b">
            <ErrorMessage message={error} />
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Última Modificación
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {news.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4 font-medium text-text-dark">
                  {article.title}
                </td>
                <td className="px-6 py-4 text-text-light">
                  {article.first_name} {article.last_name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      article.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {article.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-light">
                  {new Date(article.updated_at).toLocaleDateString("es-ES")}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(article)}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminPageLayout>

      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Confirmar Borrado"
          message={`¿Eliminar la noticia "${selectedArticle?.title}"?`}
          onConfirm={handleConfirmDelete}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  );
}

export default NewsManagementPage;
