// server/models/roleModel.js
const db = require('../config/database');

class Role {
  static async getAll() {
    const [rows] = await db.query('SELECT id, name FROM roles ORDER BY name ASC');
    return rows;
  }
}

module.exports = Role;