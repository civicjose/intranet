// server/models/areaModel.js
const db = require('../config/database');

class Area {
  static async getAll() {
    const [rows] = await db.query(
      'SELECT a.*, d.name as division_name FROM areas a LEFT JOIN divisions d ON a.division_id = d.id ORDER BY a.order_index ASC, a.name ASC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM areas WHERE id = ?', [id]);
    return rows[0];
  }

  static async create({ name, division_id, order_index }) {
    const [result] = await db.query('INSERT INTO areas (name, division_id, order_index) VALUES (?, ?, ?)', [name, division_id || null, order_index || 100]);
    return { id: result.insertId, name, division_id, order_index };
  }

  static async update(id, { name, division_id, order_index }) {
    await db.query('UPDATE areas SET name = ?, division_id = ?, order_index = ? WHERE id = ?', [name, division_id || null, order_index || 100, id]);
    return { id, name, division_id, order_index };
  }

  static async delete(id) {
    const [users] = await db.query('SELECT id FROM users WHERE area_id = ?', [id]);
    if (users.length > 0) {
      throw new Error('No se puede eliminar un área con usuarios asignados.');
    }
    await db.query('DELETE FROM areas WHERE id = ?', [id]);
  }

  // --- MÉTODO AÑADIDO ---
  static async reorder(orderedIds) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await Promise.all(
        orderedIds.map((id, index) => 
          connection.query('UPDATE areas SET order_index = ? WHERE id = ?', [index + 1, id])
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
module.exports = Area;