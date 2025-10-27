// server/models/jobProfileModel.js
const db = require("../config/database");

class JobProfile {

    /**
     * Busca una ficha de puesto por el ID del usuario.
     * @param {number} userId - El ID del usuario.
     * @returns {Promise<Object|null>} La ficha del puesto si existe.
     */
    static async findByUserId(userId) {
        const query = "SELECT * FROM employee_job_profiles WHERE user_id = ?";
        const [rows] = await db.query(query, [userId]);
        
        // El campo 'competencies' se guarda como JSON, lo parseamos al leerlo.
        if (rows[0] && rows[0].competencies) {
            rows[0].competencies = JSON.parse(rows[0].competencies);
        }
        
        return rows[0] || null;
    }

    /**
     * Crea o actualiza una ficha de puesto para un usuario.
     * Esta función hace un "UPSERT": si ya existe una ficha para el user_id, la actualiza. Si no, la crea.
     * @param {Object} data - Los datos de la ficha. Debe incluir user_id.
     * @returns {Promise<Object>} El resultado de la operación.
     */
    static async createOrUpdate(data) {
        // El campo de competencias se recibe como objeto, lo convertimos a string JSON para guardarlo.
        const competenciesJSON = data.competencies ? JSON.stringify(data.competencies) : null;

        const query = `
            INSERT INTO employee_job_profiles (
                user_id, position_name, department_name, supervisor_name, description_date,
                objective, degree_required, complementary_training, technical_knowledge, experience_required,
                needs_recycling, recycling_frequency, recycling_knowledge,
                functions, tools_and_equipment, competencies, annual_objectives, created_by_user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                position_name = VALUES(position_name), department_name = VALUES(department_name), 
                supervisor_name = VALUES(supervisor_name), description_date = VALUES(description_date),
                objective = VALUES(objective), degree_required = VALUES(degree_required), 
                complementary_training = VALUES(complementary_training), technical_knowledge = VALUES(technical_knowledge), 
                experience_required = VALUES(experience_required), needs_recycling = VALUES(needs_recycling), 
                recycling_frequency = VALUES(recycling_frequency), recycling_knowledge = VALUES(recycling_knowledge),
                functions = VALUES(functions), tools_and_equipment = VALUES(tools_and_equipment), 
                competencies = VALUES(competencies), annual_objectives = VALUES(annual_objectives);
        `;

        const values = [
            data.user_id, data.position_name, data.department_name, data.supervisor_name, data.description_date,
            data.objective, data.degree_required, data.complementary_training, data.technical_knowledge, data.experience_required,
            data.needs_recycling, data.recycling_frequency, data.recycling_knowledge,
            data.functions, data.tools_and_equipment, competenciesJSON, data.annual_objectives, data.created_by_user_id
        ];

        const [result] = await db.query(query, values);
        return result;
    }

    /**
     * Elimina una ficha de puesto por el ID del usuario.
     * @param {number} userId - El ID del usuario cuya ficha se eliminará.
     */
    static async deleteByUserId(userId) {
        const query = "DELETE FROM employee_job_profiles WHERE user_id = ?";
        await db.query(query, [userId]);
    }
}

module.exports = JobProfile;