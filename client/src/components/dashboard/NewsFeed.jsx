import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import NewsModal from './NewsModal';

// Componente para cada item de la lista
const NewsListItem = ({ article, onClick }) => {
  const getFullImageUrl = (path) => path ? `${apiClient.defaults.baseURL.replace('/api', '')}${path}` : null;
  const imageUrl = getFullImageUrl(article.featured_image_url);

  return (
    <div onClick={onClick} className="group cursor-pointer bg-light-bg rounded-lg p-3 flex gap-4 items-center h-full transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      {imageUrl && (
        <div className="w-24 h-24 flex-shrink-0">
          <img src={imageUrl} alt={article.title} className="rounded-md object-cover w-full h-full"/>
        </div>
      )}
      <div className="flex-grow">
        {/* Muestra las categorías como etiquetas */}
        <div className="flex items-center flex-wrap gap-1 mb-1">
          {article.categories?.map(cat => (
            <span key={cat.id} className="text-xs font-semibold text-macrosad-pink bg-macrosad-pink/10 px-2 py-0.5 rounded-full">
              {cat.name}
            </span>
          ))}
        </div>
        <h4 className="font-bold text-md text-text-dark group-hover:text-macrosad-pink transition-colors">
          {article.title}
        </h4>
        <p className="text-xs text-text-light mt-1">{new Date(article.updated_at).toLocaleDateString('es-ES')}</p>
      </div>
    </div>
  );
};

// Componente principal del feed
const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    apiClient.get('/news/published')
      .then(res => setNews(res.data))
      .catch(err => console.error("Error al cargar noticias:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
     return <div className="bg-light-card p-6 rounded-xl shadow-lg h-full animate-pulse"></div>;
  }

  return (
    <>
      <div className="bg-light-card p-6 rounded-xl shadow-lg h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-text-dark">Noticias y Anuncios</h3>
          <a href="#" className="text-sm font-semibold text-macrosad-pink hover:underline">Ver todo</a>
        </div>
        
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map(article => (
              <NewsListItem key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
            ))}
          </div>
        ) : (
          <p className="text-center text-text-light py-8">No hay noticias publicadas.</p>
        )}
      </div>
      
      {selectedArticle && <NewsModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </>
  );
};

export default NewsFeed;