// server/models/departmentModel.js
const db = require("../config/database");

class Department {
  // Obtener todos los departamentos
  static async getAll() {
    const [rows] = await db.query(
      "SELECT id, name FROM departments ORDER BY name ASC"
    );
    return rows;
  }

  // Encontrar los departamentos de un usuario
  static async findByUserId(userId) {
    const query = `
      SELECT d.id, d.name 
      FROM user_departments ud
      JOIN departments d ON ud.department_id = d.id
      WHERE ud.user_id = ?
    `;
    const [rows] = await db.query(query, [userId]);
    return rows || [];
  }

  static async findByName(name) {
    const [rows] = await db.query("SELECT * FROM departments WHERE name = ?", [
      name,
    ]);
    return rows[0];
  }

  // --- NUEVOS MÉTODOS ---

  // Crear un nuevo departamento
  static async create(name) {
    const [result] = await db.query(
      "INSERT INTO departments (name) VALUES (?)",
      [name]
    );
    return { id: result.insertId, name };
  }

  // Actualizar el nombre de un departamento
  static async update(id, name) {
    await db.query("UPDATE departments SET name = ? WHERE id = ?", [name, id]);
    return { id, name };
  }

  // Borrar un departamento
  static async delete(id) {
    // Comprobación de seguridad: ¿Hay usuarios en este departamento?
    const [users] = await db.query(
      "SELECT user_id FROM user_departments WHERE department_id = ?",
      [id]
    );
    if (users.length > 0) {
      // Si hay usuarios, lanzamos un error para evitar el borrado
      throw new Error(
        "No se puede eliminar un departamento con usuarios asignados."
      );
    }
    // Si no hay usuarios, procedemos a borrar
    await db.query("DELETE FROM departments WHERE id = ?", [id]);
  }
}

module.exports = Department;
