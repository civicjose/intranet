// server/models/areaModel.js
const db = require('../config/database');

class Area {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM areas ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM areas WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(name) {
    const [result] = await db.query('INSERT INTO areas (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
  }

  static async update(id, name) {
    await db.query('UPDATE areas SET name = ? WHERE id = ?', [name, id]);
    return { id, name };
  }

  static async delete(id) {
    // Añadiremos una comprobación para no borrar si hay usuarios asignados
    const [users] = await db.query('SELECT id FROM users WHERE area_id = ?', [id]);
    if (users.length > 0) {
      throw new Error('No se puede eliminar un área con usuarios asignados.');
    }
    await db.query('DELETE FROM areas WHERE id = ?', [id]);
  }
}
module.exports = Area;