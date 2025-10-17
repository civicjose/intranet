// server/models/locationModel.js
const db = require('../config/database');

class Location {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM locations ORDER BY type, name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { name, address, city, province, postal_code, type } = data;
    const [result] = await db.query(
      'INSERT INTO locations (name, address, city, province, postal_code, type) VALUES (?, ?, ?, ?, ?, ?)',
      [name, address, city, province, postal_code, type]
    );
    return { id: result.insertId, ...data };
  }

  static async update(id, data) {
    const { name, address, city, province, postal_code, type } = data;
    await db.query(
      'UPDATE locations SET name = ?, address = ?, city = ?, province = ?, postal_code = ?, type = ? WHERE id = ?',
      [name, address, city, province, postal_code, type, id]
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
}
module.exports = Location;