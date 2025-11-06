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
        
        if (rows[0]) {
            try {
                // Parsea las competencias si existen
                if (rows[0].competencies) {
                    rows[0].competencies = JSON.parse(rows[0].competencies);
                }
            } catch (e) {
                console.error("Error parsing competencies:", e);
                rows[0].competencies = {};
            }

            try {
                // Parsea los objetivos anuales si existen
                if (rows[0].annual_objectives) {
                    rows[0].annual_objectives = JSON.parse(rows[0].annual_objectives);
                } else {
                    rows[0].annual_objectives = [];
                }
            } catch (e) {
                console.error("Error parsing annual_objectives:", e);
                rows[0].annual_objectives = [];
            }

            try {
                // --- NUEVO: Parsea los riesgos del puesto ---
                if (rows[0].job_risks) {
                    rows[0].job_risks = JSON.parse(rows[0].job_risks);
                } else {
                    rows[0].job_risks = {}; // Asegura que sea un objeto
                }
            } catch (e) {
                console.error("Error parsing job_risks:", e);
                rows[0].job_risks = {};
            }
        }
        
        return rows[0] || null;
    }

    /**
     * Crea o actualiza una ficha de puesto para un usuario (UPSERT).
     * @param {Object} data - Los datos de la ficha. Debe incluir user_id.
     * @returns {Promise<Object>} El resultado de la operación.
     */
    static async createOrUpdate(data) {
        // Serializa los campos JSON
        const competenciesJSON = data.competencies ? JSON.stringify(data.competencies) : null;
        const objectivesJSON = data.annual_objectives ? JSON.stringify(data.annual_objectives) : '[]';
        // --- NUEVO: Serializa los riesgos del puesto ---
        const jobRisksJSON = data.job_risks ? JSON.stringify(data.job_risks) : '{}';

        const {
            user_id, position_name, department_name, supervisor_name, description_date,
            objective, degree_required, complementary_training, technical_knowledge, experience_required,
            needs_recycling, recycling_frequency, recycling_knowledge,
            functions, tools_and_equipment,
            created_by_user_id
        } = data;

        const query = `
            INSERT INTO employee_job_profiles (
                user_id, position_name, department_name, supervisor_name, description_date,
                objective, degree_required, complementary_training, technical_knowledge, experience_required,
                needs_recycling, recycling_frequency, recycling_knowledge,
                functions, tools_and_equipment, competencies, 
                annual_objectives, 
                job_risks, -- <-- Campo actualizado
                created_by_user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                position_name = VALUES(position_name), department_name = VALUES(department_name), 
                supervisor_name = VALUES(supervisor_name), description_date = VALUES(description_date),
                objective = VALUES(objective), degree_required = VALUES(degree_required), 
                complementary_training = VALUES(complementary_training), technical_knowledge = VALUES(technical_knowledge), 
                experience_required = VALUES(experience_required), needs_recycling = VALUES(needs_recycling), 
                recycling_frequency = VALUES(recycling_frequency), recycling_knowledge = VALUES(recycling_knowledge),
                functions = VALUES(functions), tools_and_equipment = VALUES(tools_and_equipment), 
                competencies = VALUES(competencies), 
                annual_objectives = VALUES(annual_objectives),
                job_risks = VALUES(job_risks), -- <-- Campo actualizado
                updated_at = CURRENT_TIMESTAMP;
        `;

        const values = [
            user_id, position_name, department_name, supervisor_name, description_date,
            objective, degree_required, complementary_training, technical_knowledge, experience_required,
            needs_recycling, recycling_frequency, recycling_knowledge,
            functions, tools_and_equipment, competenciesJSON,
            objectivesJSON,
            jobRisksJSON, // <-- Pasa el JSON de riesgos
            created_by_user_id
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