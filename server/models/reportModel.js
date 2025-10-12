// server/models/reportModel.js
const db = require("../config/database");

class Report {
  // Para el admin: obtiene todos los informes y los usuarios asignados
  static async getAll() {
    const query = `
      SELECT r.id, r.title, r.description,
             (SELECT JSON_ARRAYAGG(
                JSON_OBJECT('id', u.id, 'name', CONCAT(u.first_name, ' ', u.last_name))
              )
              FROM report_permissions rp
              JOIN users u ON rp.user_id = u.id
              WHERE rp.report_id = r.id) as assigned_users
      FROM reports r
      ORDER BY r.title ASC
    `;
    const [rows] = await db.query(query);
    return rows.map((row) => ({
      ...row,
      assigned_users: JSON.parse(row.assigned_users || "[]"),
    }));
  }

  // Para el usuario: obtiene solo los informes asignados a su ID
  static async findByUserId(userId) {
    const query = `
      SELECT r.id, r.title, r.description
      FROM reports r
      JOIN report_permissions rp ON r.id = rp.report_id
      WHERE rp.user_id = ?
      ORDER BY r.title ASC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
  }

  // Devuelve un informe específico SOLO SI el usuario tiene permiso
  static async findByIdForUser(reportId, userId) {
    const query = `
      SELECT r.id, r.title, r.powerbi_url
      FROM reports r
      JOIN report_permissions rp ON r.id = rp.report_id
      WHERE r.id = ? AND rp.user_id = ?
    `;
    const [rows] = await db.query(query, [reportId, userId]);
    return rows[0];
  }

  // --- NUEVOS MÉTODOS PARA ADMINISTRACIÓN ---

  static async create(
    { title, description, powerbi_url },
    assigned_users = []
  ) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        "INSERT INTO reports (title, description, powerbi_url) VALUES (?, ?, ?)",
        [title, description, powerbi_url]
      );
      const reportId = result.insertId;
      if (assigned_users.length > 0) {
        const permissionValues = assigned_users.map((userId) => [
          reportId,
          userId,
        ]);
        await connection.query(
          "INSERT INTO report_permissions (report_id, user_id) VALUES ?",
          [permissionValues]
        );
      }
      await connection.commit();
      return { id: reportId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(
    id,
    { title, description, powerbi_url },
    assigned_users = []
  ) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        "UPDATE reports SET title = ?, description = ?, powerbi_url = ? WHERE id = ?",
        [title, description, powerbi_url, id]
      );
      await connection.query(
        "DELETE FROM report_permissions WHERE report_id = ?",
        [id]
      );
      if (assigned_users.length > 0) {
        const permissionValues = assigned_users.map((userId) => [id, userId]);
        await connection.query(
          "INSERT INTO report_permissions (report_id, user_id) VALUES ?",
          [permissionValues]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    // La BBDD está configurada para borrar en cascada, por lo que una simple consulta es suficiente
    await db.query("DELETE FROM reports WHERE id = ?", [id]);
  }

  static async findByIdAdmin(id) {
    const query = `
      SELECT r.id, r.title, r.description, r.powerbi_url,
             (SELECT JSON_ARRAYAGG(u.id)
              FROM report_permissions rp
              JOIN users u ON rp.user_id = u.id
              WHERE rp.report_id = r.id) as assigned_users_ids
      FROM reports r
      WHERE r.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    if (!rows[0]) return null;
    // Nos aseguramos de que el array de IDs sea siempre un array
    const report = rows[0];
    report.assigned_users_ids = JSON.parse(report.assigned_users_ids || "[]");
    return report;
  }
}
module.exports = Report;
