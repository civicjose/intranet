// server/models/territoryModel.js
const db = require('../config/database');

class Territory {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM territories ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM territories WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(name) {
    const [result] = await db.query('INSERT INTO territories (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
  }

  static async update(id, name) {
    await db.query('UPDATE territories SET name = ? WHERE id = ?', [name, id]);
    return { id, name };
  }

  static async delete(id) {
    const [users] = await db.query('SELECT id FROM users WHERE territory_id = ?', [id]);
    if (users.length > 0) {
      throw new Error('No se puede eliminar un territorio con usuarios asignados.');
    }
    await db.query('DELETE FROM territories WHERE id = ?', [id]);
  }
}
module.exports = Territory;