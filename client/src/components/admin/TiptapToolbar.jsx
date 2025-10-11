// client/src/components/admin/TiptapToolbar.jsx
import React from 'react';
import { MdFormatBold, MdFormatItalic, MdFormatStrikethrough, MdFormatListBulleted, MdFormatListNumbered, MdFormatQuote, MdImage } from 'react-icons/md';
import apiClient from '../../services/api';

const TiptapToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Componente reutilizable para los botones de la barra de herramientas
  const Button = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${isActive ? 'bg-macrosad-pink text-white' : 'hover:bg-gray-200'}`}
      title={title}
    >
      {children}
    </button>
  );

  // Función para manejar la subida de la imagen
  const addImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Llama a la nueva ruta del backend que creamos
      const { data } = await apiClient.post('/news/image-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Construye la URL completa para mostrar la imagen
      const url = `${apiClient.defaults.baseURL.replace('/api', '')}${data.url}`;
      
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      alert('No se pudo subir la imagen.');
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border border-gray-300 bg-gray-50 rounded-t-lg flex-wrap">
      <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Negrita">
        <MdFormatBold size={20} />
      </Button>
      <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Cursiva">
        <MdFormatItalic size={20} />
      </Button>
      <Button onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Tachado">
        <MdFormatStrikethrough size={20} />
      </Button>
      <Button onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Lista de viñetas">
        <MdFormatListBulleted size={20} />
      </Button>
      <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Lista numerada">
        <MdFormatListNumbered size={20} />
      </Button>
      <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Cita">
        <MdFormatQuote size={20} />
      </Button>
      
      {/* Botón para subir imágenes */}
      <input type="file" id="image-upload" className="hidden" onChange={addImage} accept="image/*" />
      <Button onClick={() => document.getElementById('image-upload').click()} title="Insertar imagen">
        <MdImage size={20} />
      </Button>
    </div>
  );
};

export default TiptapToolbar;