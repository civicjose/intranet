// server/controllers/newsController.js
const News = require('../models/newsModel');

/**
 * @desc    Obtener todas las noticias (para panel de admin)
 * @route   GET /api/news
 * @access  Private/Admin
 */
exports.getAllNews = async (req, res, next) => {
  try {
    const news = await News.getAll();
    res.status(200).json(news);
  } catch (error) { next(error); }
};

/**
 * @desc    Obtener noticias publicadas (para dashboard)
 * @route   GET /api/news/published
 * @access  Private
 */
exports.getPublishedNews = async (req, res, next) => {
    try {
      const news = await News.getPublished();
      res.status(200).json(news);
    } catch (error) { next(error); }
};

/**
 * @desc    Obtener una noticia por su ID (para el editor)
 * @route   GET /api/news/:id
 * @access  Private/Admin
 */
exports.getNewsById = async (req, res, next) => {
    try {
        const article = await News.findById(req.params.id);
        if (!article) {
            res.status(404);
            throw new Error('Noticia no encontrada.');
        }
        res.status(200).json(article);
    } catch (error) { next(error); }
};

/**
 * @desc    Crear una nueva noticia
 * @route   POST /api/news
 * @access  Private/Admin
 */
exports.createNews = async (req, res, next) => {
  const { title, content, status, featured_image_url, categories } = req.body;
  const author_id = req.user.id;

  if (!title || !content || !status) {
    res.status(400);
    return next(new Error('Faltan campos requeridos: título, contenido y estado.'));
  }
  try {
    const newArticle = await News.create(author_id, { title, content, status, featured_image_url, categories });
    res.status(201).json(newArticle);
  } catch (error) { next(error); }
};

/**
 * @desc    Actualizar una noticia
 * @route   PUT /api/news/:id
 * @access  Private/Admin
 */
exports.updateNews = async (req, res, next) => {
    const { title, content, status, featured_image_url, categories } = req.body;
    if (!title || !content || !status) {
        res.status(400);
        return next(new Error('Faltan campos requeridos: título, contenido y estado.'));
    }
    try {
        await News.update(req.params.id, { title, content, status, featured_image_url, categories });
        res.status(200).json({ message: 'Noticia actualizada correctamente.' });
    } catch (error) { next(error); }
};

/**
 * @desc    Borrar una noticia
 * @route   DELETE /api/news/:id
 * @access  Private/Admin
 */
exports.deleteNews = async (req, res, next) => {
    try {
        const article = await News.findById(req.params.id);
        if (!article) {
            res.status(404);
            throw new Error('Noticia no encontrada.');
        }
        await News.delete(req.params.id);
        res.status(200).json({ message: 'Noticia eliminada correctamente.' });
    } catch (error) { next(error); }
};