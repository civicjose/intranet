// server/models/divisionModel.js
const db = require('../config/database');

class Division {
  static async getAll() {
    // Ordenamos primero por el índice de orden y luego por nombre
    const [rows] = await db.query('SELECT * FROM divisions ORDER BY order_index ASC, name ASC');
    return rows;
  }

  static async create({ name, order_index }) {
    const [result] = await db.query('INSERT INTO divisions (name, order_index) VALUES (?, ?)', [name, order_index || 100]);
    return { id: result.insertId, name, order_index };
  }

  static async update(id, { name, order_index }) {
    await db.query('UPDATE divisions SET name = ?, order_index = ? WHERE id = ?', [name, order_index || 100, id]);
    return { id, name, order_index };
  }

  static async delete(id) {
    const [users] = await db.query('SELECT id FROM users WHERE division_id = ?', [id]);
    if (users.length > 0) {
      throw new Error('No se puede eliminar una división con usuarios asignados.');
    }
    await db.query('DELETE FROM divisions WHERE id = ?', [id]);
  }

  static async reorder(orderedIds) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Usamos Promise.all para ejecutar todas las actualizaciones en paralelo
      await Promise.all(
        orderedIds.map((id, index) => 
          connection.query('UPDATE divisions SET order_index = ? WHERE id = ?', [index + 1, id])
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
module.exports = Division;