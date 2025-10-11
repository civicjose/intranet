import React from 'react';
import { MdClose, MdPerson, MdCalendarToday } from 'react-icons/md';
import apiClient from '../../services/api';

const NewsModal = ({ article, onClose }) => {
  if (!article) return null;

  const getFullImageUrl = (path) => path ? `${apiClient.defaults.baseURL.replace('/api', '')}${path}` : null;
  const imageUrl = getFullImageUrl(article.featured_image_url);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Botón de cierre fijo y accesible */}
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/30 text-white rounded-full p-2 z-10 hover:bg-black/50 transition-colors">
            <MdClose size={24} />
        </button>
        
        {/* Contenedor con scroll para todo el contenido */}
        <div className="flex-grow overflow-y-auto">
          {imageUrl && (
            <div className="w-full h-80 bg-gray-200">
              <img src={imageUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <article className="p-8 md:p-12">
            {/* --- CABECERA DEL ARTÍCULO --- */}
            <header>
              {/* Categorías */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {article.categories?.map(cat => (
                  <span key={cat.id} className="text-sm font-semibold text-macrosad-pink">
                    {cat.name}
                  </span>
                ))}
              </div>
              
              {/* Título */}
              <h1 className="text-4xl md:text-5xl font-bold text-text-dark leading-tight">
                {article.title}
              </h1>

              {/* Información del Autor y Fecha */}
              <div className="flex items-center text-sm text-text-light mt-6">
                <div className="flex items-center">
                  <MdPerson className="mr-2"/>
                  <span>{article.first_name} {article.last_name}</span>
                </div>
                <span className="mx-3">|</span>
                <div className="flex items-center">
                  <MdCalendarToday className="mr-2"/>
                  <span>{new Date(article.updated_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </header>

            <hr className="my-8" />
            
            {/* --- CUERPO DEL ARTÍCULO --- */}
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </article>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;