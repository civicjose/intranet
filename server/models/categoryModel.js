// server/models/categoryModel.js
const db = require('../config/database');

class Category {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM news_categories ORDER BY name ASC');
    return rows;
  }
  static async findByName(name) {
    const [rows] = await db.query('SELECT * FROM news_categories WHERE name = ?', [name]);
    return rows[0];
  }
  static async create(name) {
    const [result] = await db.query('INSERT INTO news_categories (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
  }
  static async update(id, name) {
    await db.query('UPDATE news_categories SET name = ? WHERE id = ?', [name, id]);
  }
  static async delete(id) {
    await db.query('DELETE FROM news_categories WHERE id = ?', [id]);
  }
}
module.exports = Category;