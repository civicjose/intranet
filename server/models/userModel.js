// server/models/userModel.js
const db = require("../config/database");

class User {
  // --- MÉTODOS DE BÚSQUEDA ---

  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      "SELECT id, email, first_name, last_name, company_phone, role_id, avatar_url, birth_date FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async findByVerificationCode(code) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE verification_code = ?",
      [code]
    );
    return rows[0];
  }

  // --- MÉTODOS PARA EL FLUJO DE REGISTRO ---

  static async create(email, hashedCode, expiresAt) {
    await db.query(
      "INSERT INTO users (email, verification_code, verification_code_expires_at) VALUES (?, ?, ?)",
      [email, hashedCode, expiresAt]
    );
  }

  static async updateVerificationCode(email, hashedCode, expiresAt) {
    await db.query(
      "UPDATE users SET verification_code = ?, verification_code_expires_at = ? WHERE email = ?",
      [hashedCode, expiresAt, email]
    );
  }

  static async setPasswordAndProfile(
    userId,
    { hashedPassword, firstName, lastName, companyPhone, birthDate }
  ) {
    const query = `
      UPDATE users SET 
          password = ?, 
          first_name = ?,
          last_name = ?,
          company_phone = ?,
          birth_date = ?,
          is_verified = TRUE, 
          verification_code = NULL, 
          verification_code_expires_at = NULL
      WHERE id = ?
    `;
    await db.query(query, [
      hashedPassword,
      firstName,
      lastName,
      companyPhone,
      birthDate || null,
      userId,
    ]);
  }

  // --- MÉTODOS PARA EL PERFIL DE USUARIO ---

  static async updateProfile(
    userId,
    { firstName, lastName, companyPhone, birthDate }
  ) {
    await db.query(
      "UPDATE users SET first_name = ?, last_name = ?, company_phone = ?, birth_date = ? WHERE id = ?",
      [firstName, lastName, companyPhone, birthDate, userId]
    );
  }

  static async updateAvatar(userId, avatarUrl) {
    await db.query("UPDATE users SET avatar_url = ? WHERE id = ?", [
      avatarUrl,
      userId,
    ]);
  }

  // --- MÉTODOS PARA ADMINISTRACIÓN ---

  static async adminCreate(
    { email, firstName, lastName, role_id, departments = [] },
    verificationData
  ) {
    const { hashedCode, expiresAt } = verificationData;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        "INSERT INTO users (email, first_name, last_name, role_id, verification_code, verification_code_expires_at, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [email, firstName, lastName, role_id, hashedCode, expiresAt, false]
      );
      const newUserId = result.insertId;
      if (departments.length > 0) {
        const departmentValues = departments.map((deptId) => [
          newUserId,
          deptId,
        ]);
        await connection.query(
          "INSERT INTO user_departments (user_id, department_id) VALUES ?",
          [departmentValues]
        );
      }
      await connection.commit();
      return newUserId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAll() {
    const query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.company_phone, u.is_verified, 
        u.role_id, u.avatar_url, u.birth_date,
        r.name as role_name,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', d.id, 'name', d.name))
          FROM user_departments ud
          JOIN departments d ON ud.department_id = d.id
          WHERE ud.user_id = u.id
        ) as departments
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      GROUP BY u.id
      ORDER BY u.first_name, u.last_name;
    `;
    const [users] = await db.query(query);

    return users.map((user) => {
      let departmentsArray = [];
      if (typeof user.departments === "string") {
        departmentsArray = JSON.parse(user.departments);
      } else if (Array.isArray(user.departments)) {
        departmentsArray = user.departments;
      }

      if (
        departmentsArray &&
        departmentsArray[0] &&
        departmentsArray[0].id === null
      ) {
        departmentsArray = [];
      }

      return { ...user, departments: departmentsArray };
    });
  }

  static async update(
    userId,
    { firstName, lastName, email, company_phone, role_id, departments = [] }
  ) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        "UPDATE users SET first_name = ?, last_name = ?, email = ?, company_phone = ?, role_id = ? WHERE id = ?",
        [firstName, lastName, email, company_phone, role_id, userId]
      );
      await connection.query("DELETE FROM user_departments WHERE user_id = ?", [
        userId,
      ]);
      if (departments && departments.length > 0) {
        const departmentValues = departments.map((deptId) => [userId, deptId]);
        await connection.query(
          "INSERT INTO user_departments (user_id, department_id) VALUES ?",
          [departmentValues]
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

  static async delete(userId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query("DELETE FROM user_departments WHERE user_id = ?", [
        userId,
      ]);
      await connection.query("DELETE FROM users WHERE id = ?", [userId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = User;
