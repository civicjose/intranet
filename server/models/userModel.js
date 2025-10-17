// server/models/userModel.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

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
    {
      email,
      firstName,
      lastName,
      companyPhone,
      birthDate,
      role_id,
      departments = [],
      area_id,
      position_id,
      territory_id,
      location_id,
    },
    verificationData
  ) {
    const { hashedCode, expiresAt } = verificationData;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const finalAreaId = departments.length > 0 ? null : area_id || null;
      const [result] = await connection.query(
        "INSERT INTO users (email, first_name, last_name, company_phone, birth_date, role_id, verification_code, verification_code_expires_at, is_verified, area_id, position_id, territory_id, location_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          email,
          firstName,
          lastName,
          companyPhone || null,
          birthDate || null,
          role_id,
          hashedCode,
          expiresAt,
          false,
          finalAreaId,
          position_id || null,
          territory_id || null,
          location_id || null,
        ]
      );
      const newUserId = result.insertId;
      if (departments.length > 0 && !finalAreaId) {
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

  static async adminCreateWithPassword({
    email,
    firstName,
    lastName,
    companyPhone,
    birthDate,
    role_id,
    departments = [],
    password,
    area_id,
    position_id,
    territory_id,
    location_id,
  }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const finalAreaId = departments.length > 0 ? null : area_id || null;
      const [result] = await connection.query(
        "INSERT INTO users (email, first_name, last_name, company_phone, birth_date, role_id, password, is_verified, area_id, position_id, territory_id, location_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          email,
          firstName,
          lastName,
          companyPhone || null,
          birthDate || null,
          role_id,
          hashedPassword,
          true,
          finalAreaId,
          position_id || null,
          territory_id || null,
          location_id || null,
        ]
      );
      const newUserId = result.insertId;
      if (departments.length > 0 && !finalAreaId) {
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
        u.id, u.email, u.first_name, u.last_name, u.company_phone, u.birth_date, u.is_verified, 
        u.role_id, u.avatar_url, u.area_id, u.position_id, u.territory_id, u.location_id,
        r.name as role_name, a.name as area_name, p.name as position_name,
        t.name as territory_name, l.name as location_name,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', d.id, 'name', d.name))
          FROM user_departments ud JOIN departments d ON ud.department_id = d.id
          WHERE ud.user_id = u.id
        ) as departments
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN areas a ON u.area_id = a.id
      LEFT JOIN positions p ON u.position_id = p.id
      LEFT JOIN territories t ON u.territory_id = t.id
      LEFT JOIN locations l ON u.location_id = l.id
      GROUP BY u.id
      ORDER BY u.first_name, u.last_name;
    `;
    const [users] = await db.query(query);
    return users.map((user) => {
      let departmentsArray = [];
      if (typeof user.departments === "string") {
        try {
          departmentsArray = JSON.parse(user.departments);
        } catch (e) {
          departmentsArray = [];
        }
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
    {
      firstName,
      lastName,
      email,
      company_phone,
      birth_date,
      role_id,
      departments = [],
      area_id,
      position_id,
      territory_id,
      location_id,
      avatar_url,
    }
  ) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const finalAreaId =
        departments && departments.length > 0 ? null : area_id || null;
      await connection.query(
        `UPDATE users SET 
          first_name = ?, last_name = ?, email = ?, company_phone = ?, birth_date = ?, role_id = ?,
          area_id = ?, territory_id = ?, position_id = ?, location_id = ?, avatar_url = ?
         WHERE id = ?`,
        [
          firstName,
          lastName,
          email,
          company_phone || null,
          birth_date || null,
          role_id,
          finalAreaId,
          territory_id || null,
          position_id || null,
          location_id || null,
          avatar_url,
          userId,
        ]
      );
      await connection.query("DELETE FROM user_departments WHERE user_id = ?", [
        userId,
      ]);
      if (departments && departments.length > 0 && !finalAreaId) {
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
