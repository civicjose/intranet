// server/models/departmentModel.js
const db = require("../config/database");

class Department {
  static async getAll() {
    const query = `
      SELECT d.id, d.name, d.area_id, a.name as area_name
      FROM departments d
      LEFT JOIN areas a ON d.area_id = a.id
      ORDER BY d.name ASC
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  // --- ESTA ES LA FUNCIÓN QUE FALTA ---
  // Encontrar los departamentos de un usuario específico.
  static async findByUserId(userId) {
    const query = `
      SELECT d.id, d.name 
      FROM user_departments ud
      JOIN departments d ON ud.department_id = d.id
      WHERE ud.user_id = ?
      ORDER BY d.name ASC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows || [];
  }
  // ------------------------------------

  static async findByName(name) {
    const [rows] = await db.query("SELECT * FROM departments WHERE name = ?", [
      name,
    ]);
    return rows[0];
  }

  static async create({ name, area_id }) {
    const [result] = await db.query(
      "INSERT INTO departments (name, area_id) VALUES (?, ?)",
      [name, area_id || null]
    );
    return { id: result.insertId, name, area_id };
  }

  static async update(id, { name, area_id }) {
    await db.query("UPDATE departments SET name = ?, area_id = ? WHERE id = ?", [
      name,
      area_id || null,
      id,
    ]);
    return { id, name, area_id };
  }

  static async delete(id) {
    const [users] = await db.query(
      "SELECT user_id FROM user_departments WHERE department_id = ?",
      [id]
    );
    if (users.length > 0) {
      throw new Error("No se puede eliminar un departamento con usuarios asignados.");
    }
    await db.query("DELETE FROM departments WHERE id = ?", [id]);
  }
}

module.exports = Department;