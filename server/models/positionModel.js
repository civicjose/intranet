// server/models/positionModel.js
const db = require('../config/database');

class Position {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM positions ORDER BY order_index ASC, name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM positions WHERE id = ?', [id]);
    return rows[0];
  }

  static async create({ name, order_index }) {
    const [result] = await db.query('INSERT INTO positions (name, order_index) VALUES (?, ?)', [name, order_index || 100]);
    return { id: result.insertId, name, order_index };
  }

  static async update(id, { name, order_index }) {
    await db.query('UPDATE positions SET name = ?, order_index = ? WHERE id = ?', [name, order_index || 100, id]);
    return { id, name, order_index };
  }

  static async delete(id) {
    const [users] = await db.query('SELECT id FROM users WHERE position_id = ?', [id]);
    if (users.length > 0) {
      throw new Error('No se puede eliminar un puesto con usuarios asignados.');
    }
    await db.query('DELETE FROM positions WHERE id = ?', [id]);
  }

  // --- MÉTODO AÑADIDO ---
  static async reorder(orderedIds) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await Promise.all(
        orderedIds.map((id, index) => 
          connection.query('UPDATE positions SET order_index = ? WHERE id = ?', [index + 1, id])
        )
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
module.exports = Position;