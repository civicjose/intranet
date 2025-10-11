// server/models/newsModel.js
const db = require('../config/database');

class News {
  // Función auxiliar para parsear las categorías de forma segura
  static parseCategories(row) {
    let categoriesArray = [];
    if (typeof row.categories === 'string') {
      try {
        categoriesArray = JSON.parse(row.categories);
      } catch (e) {
        categoriesArray = [];
      }
    } else if (Array.isArray(row.categories)) {
      categoriesArray = row.categories;
    }
    
    if (categoriesArray && categoriesArray[0] && categoriesArray[0].id === null) {
      categoriesArray = [];
    }
    return { ...row, categories: categoriesArray };
  }

  // --- MÉTODOS DE BÚSQUEDA ---

  static async getAll() {
    const query = `
      SELECT n.id, n.title, n.status, n.updated_at, n.featured_image_url, 
             u.first_name, u.last_name,
             (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', nc.id, 'name', nc.name))
              FROM news_article_categories nac
              JOIN news_categories nc ON nac.category_id = nc.id
              WHERE nac.article_id = n.id) as categories
      FROM news n
      JOIN users u ON n.author_id = u.id
      ORDER BY n.updated_at DESC
    `;
    const [rows] = await db.query(query);
    return rows.map(this.parseCategories); // Usamos la función auxiliar
  }

  static async getPublished() {
    const query = `
      SELECT n.id, n.title, n.content, n.updated_at, n.featured_image_url, 
             u.first_name, u.last_name,
             (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', nc.id, 'name', nc.name))
              FROM news_article_categories nac
              JOIN news_categories nc ON nac.category_id = nc.id
              WHERE nac.article_id = n.id) as categories
      FROM news n
      JOIN users u ON n.author_id = u.id
      WHERE n.status = 'published'
      ORDER BY n.updated_at DESC
      LIMIT 5
    `;
    const [rows] = await db.query(query);
    return rows.map(this.parseCategories); // Usamos la función auxiliar
  }

  static async findById(id) {
    const query = `
      SELECT n.*,
             (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', nc.id, 'name', nc.name))
              FROM news_article_categories nac
              JOIN news_categories nc ON nac.category_id = nc.id
              WHERE nac.article_id = n.id) as categories
      FROM news n
      WHERE n.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    if (!rows[0]) return null;
    return this.parseCategories(rows[0]);
  }

  // --- MÉTODOS DE ESCRITURA (CON TRANSACCIONES) ---

  static async create(author_id, { title, content, status, featured_image_url, categories = [] }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        'INSERT INTO news (title, content, author_id, status, featured_image_url) VALUES (?, ?, ?, ?, ?)',
        [title, content, author_id, status, featured_image_url]
      );
      const articleId = result.insertId;
      if (categories.length > 0) {
        const categoryValues = categories.map(catId => [articleId, catId]);
        await connection.query('INSERT INTO news_article_categories (article_id, category_id) VALUES ?', [categoryValues]);
      }
      await connection.commit();
      return { id: articleId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, { title, content, status, featured_image_url, categories = [] }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        'UPDATE news SET title = ?, content = ?, status = ?, featured_image_url = ? WHERE id = ?',
        [title, content, status, featured_image_url, id]
      );
      await connection.query('DELETE FROM news_article_categories WHERE article_id = ?', [id]);
      if (categories.length > 0) {
        const categoryValues = categories.map(catId => [id, catId]);
        await connection.query('INSERT INTO news_article_categories (article_id, category_id) VALUES ?', [categoryValues]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    await db.query('DELETE FROM news WHERE id = ?', [id]);
  }
}

module.exports = News;