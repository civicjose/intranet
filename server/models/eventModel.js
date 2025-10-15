// server/models/eventModel.js
const db = require('../config/database');

class Event {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM events ORDER BY start_date ASC');
    return rows;
  }

  static async create({ title, start_date, end_date, all_day, description }) {
    const finalEndDate = end_date || null;
    const [result] = await db.query(
      'INSERT INTO events (title, start_date, end_date, all_day, description) VALUES (?, ?, ?, ?, ?)',
      [title, start_date, finalEndDate, all_day, description]
    );
    return { id: result.insertId, title, start_date };
  }

  // --- NUEVO: Actualizar un evento ---
  static async update(id, { title, start_date, end_date, all_day, description }) {
    const finalEndDate = end_date || null;
    await db.query(
      'UPDATE events SET title = ?, start_date = ?, end_date = ?, all_day = ?, description = ? WHERE id = ?',
      [title, start_date, finalEndDate, all_day, description, id]
    );
    return { id, title, start_date };
  }

  // --- NUEVO: Borrar un evento ---
  static async delete(id) {
    await db.query('DELETE FROM events WHERE id = ?', [id]);
  }
}

module.exports = Event;