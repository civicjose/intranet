// client/src/pages/admin/NewsManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link
import apiClient from '../../services/api';
import { MdEdit, MdDelete } from 'react-icons/md';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const NewsManagementPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/news');
      setNews(data);
    } catch (err) {
      setError('No se pudo cargar la lista de noticias.');
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
      fetchNews(); // Recarga la lista
    } catch (err) {
      setError('No se pudo eliminar la noticia.');
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <div>Cargando noticias...</div>;

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Noticias</h1>
          <p className="text-gray-500">Crea, edita y publica comunicados internos.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* --- NUEVO BOTÓN PARA GESTIONAR CATEGORÍAS --- */}
          <Link to="/admin/news/categories" className="bg-white border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-100">
            Gestionar Categorías
          </Link>
          <button onClick={() => navigate('/admin/news/new')} className="bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
              + Nueva Noticia
          </button>
        </div>
      </header>
      <div className="bg-light-card shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Modificación</th>
              <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {news.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4 font-medium text-text-dark">{article.title}</td>
                <td className="px-6 py-4 text-text-light">{article.first_name} {article.last_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {article.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-light">{new Date(article.updated_at).toLocaleDateString('es-ES')}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => navigate(`/admin/news/edit/${article.id}`)} className="text-indigo-600 hover:text-indigo-900"><MdEdit size={20} /></button>
                  <button onClick={() => handleDeleteClick(article)} className="text-red-600 hover:text-red-900 ml-4"><MdDelete size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isDeleteModalOpen && (
        <ConfirmationModal 
          title="Confirmar Borrado"
          message={`¿Estás seguro de que quieres eliminar la noticia "${selectedArticle?.title}"?`}
          onConfirm={handleConfirmDelete}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default NewsManagementPage;