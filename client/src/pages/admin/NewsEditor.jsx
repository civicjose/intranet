import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';

// Importa los componentes y hooks de Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TiptapToolbar from '../../components/admin/TiptapToolbar';
import { MdImage, MdClose } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import ErrorMessage from '../../components/ErrorMessage';

const NewsEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Estados para el contenido
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para la imagen destacada
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  
  // Estados para las categorías
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const editor = useEditor({
    extensions: [ StarterKit, Image ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-4 border border-t-0 border-gray-300 rounded-b-lg min-h-[400px] focus:outline-none',
      },
    },
  });

  const getFullImageUrl = (path) => path ? `${apiClient.defaults.baseURL.replace('/api', '')}${path}` : null;

  useEffect(() => {
    // Carga todas las categorías disponibles para el formulario
    apiClient.get('/categories')
      .then(res => setAllCategories(res.data))
      .catch(() => setError('No se pudieron cargar las categorías.'));

    if (isEditing && editor) {
      setLoading(true);
      apiClient.get(`/news/${id}`)
        .then(res => {
          setTitle(res.data.title);
          setStatus(res.data.status);
          editor.commands.setContent(res.data.content);
          setExistingImageUrl(res.data.featured_image_url);
          setSelectedCategories(res.data.categories?.map(cat => cat.id) || []);
        })
        .catch(() => setError('No se pudo cargar la noticia.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, editor]);

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
      setExistingImageUrl(null);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleSave = async (newStatus) => {
    if (!editor) return;
    setLoading(true);
    setError('');
    
    try {
      let featuredImageUrl = existingImageUrl;
      if (featuredImage) {
        const formData = new FormData();
        formData.append('image', featuredImage);
        const { data } = await apiClient.post('/news/image-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        featuredImageUrl = data.url;
      }

      const payload = { 
        title, 
        content: editor.getHTML(), 
        status: newStatus || status, 
        featured_image_url: featuredImageUrl,
        categories: selectedCategories
      };

      if (isEditing) {
        await apiClient.put(`/news/${id}`, payload);
      } else {
        await apiClient.post('/news', payload);
      }
      navigate('/admin/news');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar. Revisa que todos los campos estén completos.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div>Cargando editor...</div>;

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{isEditing ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h1>
        <Link to="/admin/news" className="text-macrosad-pink font-semibold hover:underline">&larr; Volver al listado</Link>
      </header>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-lg font-semibold"
              placeholder="Escribe un titular atractivo..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg border-b pb-3 mb-4">Publicación</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-md border-gray-300">
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleSave('published')} disabled={!editor || loading} className="w-full bg-macrosad-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex justify-center items-center">
                  {loading && <FaSpinner className="animate-spin mr-2" />}
                  {isEditing ? 'Actualizar' : 'Publicar'}
                </button>
                <button onClick={() => handleSave('draft')} disabled={!editor || loading} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                  Guardar Borrador
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg border-b pb-3 mb-4">Categorías</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allCategories.map(category => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="rounded text-macrosad-pink focus:ring-macrosad-pink"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg border-b pb-3 mb-4">Imagen Destacada</h3>
            <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed relative">
              {(featuredImagePreview || getFullImageUrl(existingImageUrl)) ? (
                <>
                  <img src={featuredImagePreview || getFullImageUrl(existingImageUrl)} alt="Vista previa" className="w-full h-full object-cover rounded-lg"/>
                  <button type="button" onClick={() => { setFeaturedImage(null); setFeaturedImagePreview(null); setExistingImageUrl(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/75">
                    <MdClose />
                  </button>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <MdImage size={40} className="mx-auto"/>
                  <p className="text-sm mt-2">Sube una imagen</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Recomendado: 1280x720px o una proporción de 16:9.</p>
            <input type="file" id="featured-image-upload" className="hidden" onChange={handleFeaturedImageChange} accept="image/*" />
            <button type="button" onClick={() => document.getElementById('featured-image-upload').click()} className="w-full mt-2 bg-white border border-gray-300 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50">
              {existingImageUrl || featuredImagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsEditor;