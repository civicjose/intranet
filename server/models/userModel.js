// server/models/userModel.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  // --- FUNCIÓN AUXILIAR PARA PARSEAR DEPARTAMENTOS ---
  static parseDepartments(user) {
    let departmentsArray = [];
    if (user.departments && typeof user.departments === "string") {
      try {
        departmentsArray = JSON.parse(user.departments);
        if (
          departmentsArray &&
          departmentsArray.length > 0 &&
          departmentsArray[0].id === null
        ) {
          departmentsArray = [];
        }
      } catch (e) {
        departmentsArray = [];
      }
    }
    return { ...user, departments: departmentsArray || [] };
  }

  // --- MÉTODOS DE BÚSQUEDA ---
  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      "SELECT id, email, first_name, last_name, company_phone, role_id, avatar_url, birth_date, order_index, supervisor_id FROM users WHERE id = ?",
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
      order_index,
      supervisor_id,
    },
    verificationData
  ) {
    const { hashedCode, expiresAt } = verificationData;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        "INSERT INTO users (email, first_name, last_name, company_phone, birth_date, role_id, verification_code, verification_code_expires_at, is_verified, area_id, position_id, territory_id, location_id, order_index, supervisor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
          area_id || null,
          position_id || null,
          territory_id || null,
          location_id || null,
          order_index || 100,
          supervisor_id || null,
        ]
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
    order_index,
    supervisor_id,
  }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        "INSERT INTO users (email, first_name, last_name, company_phone, birth_date, role_id, password, is_verified, area_id, position_id, territory_id, location_id, order_index, supervisor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          email,
          firstName,
          lastName,
          companyPhone || null,
          birthDate || null,
          role_id,
          hashedPassword,
          true,
          area_id || null,
          position_id || null,
          territory_id || null,
          location_id || null,
          order_index || 100,
          supervisor_id || null,
        ]
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
        u.id, u.email, u.first_name, u.last_name, u.company_phone, u.birth_date, u.is_verified, 
        u.role_id, u.avatar_url, u.area_id, u.position_id, u.territory_id, u.location_id, u.order_index,
        r.name as role_name, a.name as area_name, p.name as position_name,
        t.name as territory_name, l.name as location_name,
        dvs.name as division_name,
        u.supervisor_id,
        CONCAT(s.first_name, ' ', s.last_name) as supervisor_name,
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
      LEFT JOIN divisions dvs ON a.division_id = dvs.id
      LEFT JOIN users s ON u.supervisor_id = s.id
      GROUP BY u.id
      ORDER BY u.order_index ASC, u.first_name ASC, u.last_name ASC;
    `;
    const [users] = await db.query(query);
    return users.map(this.parseDepartments);
  }

  static async update(
    userId,
    {
      firstName,
      lastName,
      email,
      companyPhone,
      birthDate,
      role_id,
      departments = [],
      area_id,
      position_id,
      territory_id,
      location_id,
      avatar_url,
      order_index,
      supervisor_id,
    }
  ) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `UPDATE users SET 
          first_name = ?, last_name = ?, email = ?, company_phone = ?, birth_date = ?, role_id = ?,
          area_id = ?, territory_id = ?, position_id = ?, location_id = ?, avatar_url = ?, order_index = ?,
          supervisor_id = ?
         WHERE id = ?`,
        [
          firstName,
          lastName,
          email,
          companyPhone || null,
          birthDate || null,
          role_id,
          area_id || null,
          territory_id || null,
          position_id || null,
          location_id || null,
          avatar_url,
          order_index || 100,
          supervisor_id || null,
          userId,
        ]
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

  static async isSupervisor(userId) {
    const query = "SELECT 1 FROM users WHERE supervisor_id = ? LIMIT 1";
    const [rows] = await db.query(query, [userId]);
    return rows.length > 0;
  }

  static async findSubordinatesBySupervisorId(supervisorId) {
    const query = `
            WITH RECURSIVE subordinates AS (
                SELECT id, first_name, last_name, avatar_url, position_id, supervisor_id, area_id
                FROM users WHERE supervisor_id = ?
                UNION ALL
                SELECT u.id, u.first_name, u.last_name, u.avatar_url, u.position_id, u.supervisor_id, u.area_id
                FROM users u INNER JOIN subordinates s ON u.supervisor_id = s.id
            )
            SELECT
                sub.id, sub.first_name, sub.last_name, sub.avatar_url,
                p.name as position_name,
                CONCAT(sup.first_name, ' ', sup.last_name) as supervisor_name,
                a.name as area_name,
                sub.area_id,
                (
                  SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', d.id, 
                      'name', d.name, 
                      'area_id', d.area_id,
                      'area_name', da.name
                    )
                  )
                  FROM user_departments ud 
                  JOIN departments d ON ud.department_id = d.id
                  LEFT JOIN areas da ON d.area_id = da.id
                  WHERE ud.user_id = sub.id
                ) as departments
            FROM subordinates sub
            LEFT JOIN positions p ON sub.position_id = p.id
            LEFT JOIN users sup ON sub.supervisor_id = sup.id
            LEFT JOIN areas a ON sub.area_id = a.id;
        `;
    const [rows] = await db.query(query, [supervisorId]);
    return rows.map(this.parseDepartments);
  }

  /**
   * Reordena los usuarios según un array de IDs.
   * @param {Array<number>} orderedIds - Un array de IDs de usuario en el nuevo orden.
   */
  static async reorder(orderedIds) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await Promise.all(
        orderedIds.map((id, index) =>
          connection.query("UPDATE users SET order_index = ? WHERE id = ?", [
            index + 1,
            id,
          ])
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

module.exports = User;
