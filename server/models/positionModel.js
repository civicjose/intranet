// server/models/positionModel.js
const db = require('../config/database');

class Position {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM positions ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM positions WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(name) {
    const [result] = await db.query('INSERT INTO positions (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
  }

  static async update(id, name) {
    await db.query('UPDATE positions SET name = ? WHERE id = ?', [name, id]);
    return { id, name };
  }

  static async delete(id) {
    const [users] = await db.query('SELECT id FROM users WHERE position_id = ?', [id]);
    if (users.length > 0) {
      throw new Error('No se puede eliminar un puesto con usuarios asignados.');
    }
    await db.query('DELETE FROM positions WHERE id = ?', [id]);
  }
}
module.exports = Position;