// server/models/locationModel.js
const db = require('../config/database');

class Location {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM locations ORDER BY order_index ASC, type ASC, name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { name, address, city, province, postal_code, type, order_index } = data;
    const [result] = await db.query(
      'INSERT INTO locations (name, address, city, province, postal_code, type, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, address, city, province, postal_code, type, order_index || 100]
    );
    return { id: result.insertId, ...data };
  }

  static async update(id, data) {
    const { name, address, city, province, postal_code, type, order_index } = data;
    await db.query(
      'UPDATE locations SET name = ?, address = ?, city = ?, province = ?, postal_code = ?, type = ?, order_index = ? WHERE id = ?',
      [name, address, city, province, postal_code, type, order_index || 100, id]
    );
    return { id, ...data };
  }

  static async delete(id) {
     const [users] = await db.query('SELECT id FROM users WHERE location_id = ?', [id]);
    if (users.length > 0) {
      throw new Error('No se puede eliminar una ubicación con usuarios asignados.');
    }
    await db.query('DELETE FROM locations WHERE id = ?', [id]);
  }

  // --- MÉTODO AÑADIDO ---
  static async reorder(orderedIds) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await Promise.all(
        orderedIds.map((id, index) => 
          connection.query('UPDATE locations SET order_index = ? WHERE id = ?', [index + 1, id])
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
module.exports = Location;