// server/controllers/jobProfileController.js
const JobProfile = require('../models/jobProfileModel');
const User = require('../models/userModel'); // Necesitamos el modelo User para verificar la jerarquía
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const cheerio = require('cheerio');

/**
 * Obtiene la ficha de puesto para el usuario actualmente logueado.
 */
exports.getMyProfile = async (req, res, next) => {
    try {
        const profile = await JobProfile.findByUserId(req.user.id);
        if (!profile) {
            return res.status(200).json(null);
        }
        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene la ficha de puesto de un subordinado específico.
 * Un supervisor solo puede ver las fichas de su equipo.
 */
exports.getProfileForUser = async (req, res, next) => {
    try {
        const subordinateId = req.params.userId;
        const supervisorId = req.user.id;

        // --- LÓGICA DE PERMISOS MEJORADA ---
        // Un admin puede ver cualquier ficha.
        // Un supervisor puede ver la ficha si el usuario está en su equipo (directo o indirecto).
        const team = await User.findSubordinatesBySupervisorId(supervisorId);
        const isSubordinate = team.some(member => member.id == subordinateId);
        const isAdmin = req.user.role_id === 1;

        if (!isSubordinate && !isAdmin) {
            res.status(403);
            return next(new Error('No tienes permiso para acceder a esta ficha de puesto.'));
        }

        const profile = await JobProfile.findByUserId(subordinateId);
        if (!profile) {
            return res.status(200).json(null);
        }
        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};

/**
 * Crea o actualiza la ficha de puesto para un usuario.
 * Permitido si el que edita es supervisor (directo o indirecto) o es un admin.
 */
exports.upsertProfile = async (req, res, next) => {
    try {
        const data = req.body;
        const targetUserId = data.user_id;
        const supervisorId = req.user.id;

        // --- LÓGICA DE PERMISOS CORREGIDA ---
        // 1. Buscamos el equipo completo del usuario que hace la petición.
        const team = await User.findSubordinatesBySupervisorId(supervisorId);
        
        // 2. Comprobamos si el usuario objetivo está en ese equipo.
        const isSubordinate = team.some(member => member.id == targetUserId);
        
        // 3. Comprobamos si el usuario que edita es un Administrador (role_id 1).
        const isAdmin = req.user.role_id === 1;

        // 4. Si no es un subordinado Y TAMPOCO es un admin, denegamos el acceso.
        if (!isSubordinate && !isAdmin) {
            res.status(403);
            return next(new Error('No tienes permiso para crear o modificar la ficha de este usuario.'));
        }

        // Si pasa la validación, procedemos a guardar
        data.created_by_user_id = supervisorId;
        await JobProfile.createOrUpdate(data);

        res.status(200).json({ message: 'Ficha de puesto guardada correctamente.' });

    } catch (error) {
        next(error);
    }
};

/**
 * Elimina la ficha de puesto de un usuario.
 * Solo permitido si el que elimina es supervisor (directo o indirecto) o es un admin.
 */
exports.deleteProfile = async (req, res, next) => {
    try {
        const targetUserId = req.params.userId;
        const supervisorId = req.user.id;

        // Lógica de permisos (idéntica a la de 'upsertProfile')
        const team = await User.findSubordinatesBySupervisorId(supervisorId);
        const isSubordinate = team.some(member => member.id == targetUserId);
        const isAdmin = req.user.role_id === 1;

        if (!isSubordinate && !isAdmin) {
            res.status(403);
            return next(new Error('No tienes permiso para eliminar la ficha de este usuario.'));
        }

        await JobProfile.deleteByUserId(targetUserId);

        res.status(200).json({ message: 'Ficha de puesto eliminada correctamente.' });

    } catch (error) {
        next(error);
    }
};

// Helper para limpiar el HTML de Tiptap/Quill
const parseHtmlToList = (htmlContent) => {
    if (!htmlContent) return [];
    const $ = cheerio.load(htmlContent);
    const list = [];
    $('li').each((i, el) => {
        list.push($(el).text());
    });
    return list;
};

// Helper para limpiar un párrafo de HTML
const parseHtmlToText = (htmlContent) => {
    if (!htmlContent) return '';
    const $ = cheerio.load(htmlContent);
    return $.text();
};

// Helper para crear los placeholders de las competencias (1-5)
const formatCompetencies = (competencies) => {
    const formatted = {};
    const competencyKeys = ['flexibilidad', 'responsabilidad', 'iniciativa', 'orientacion_resultados', 'autoconfianza'];
    
    competencyKeys.forEach(key => {
        const value = competencies ? competencies[key] : 0; // Valor del 1 al 5
        for (let i = 1; i <= 5; i++) {
            formatted[`${key}_${i}`] = (i == value) ? 'X' : '';
        }
    });
    return formatted;
};

// Controlador principal de descarga
exports.downloadWordProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await JobProfile.findByUserId(userId);

        if (!profile) {
            return res.status(404).json({ message: 'Ficha de puesto no encontrada.' });
        }

        // 1. Cargar la plantilla .docx
        const templatePath = path.resolve(__dirname, '..', 'template_ficha_puesto.docx');
        const content = fs.readFileSync(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // 2. Preparar los datos para la plantilla
        const data = {
            ...profile,
            // Sobrescribir campos con datos parseados
            description_date: new Date(profile.description_date).toLocaleDateString('es-ES'),
            objective: parseHtmlToText(profile.objective),
            
            // Limpiar texto plano (si viene de textareas)
            degree_required: profile.degree_required.replace(/\n/g, '\n'),
            complementary_training: profile.complementary_training.replace(/\n/g, '\n'),
            technical_knowledge: profile.technical_knowledge.replace(/\n/g, '\n'),
            
            // Convertir HTML de listas a arrays
            functions_list: parseHtmlToList(profile.functions),
            tools_list: parseHtmlToList(profile.tools_and_equipment),
            
            // Convertir 'true' a 'SÍ'/'NO'
            needs_recycling: profile.needs_recycling ? 'SÍ' : 'NO',
            
            // Mapear competencias a las columnas 'X'
            ...formatCompetencies(profile.competencies),

            // Formatear objetivos para el bucle
            annual_objectives: profile.annual_objectives.map((obj, i) => ({
                idx: i + 1,
                text: obj
            })),

            // Renombrar 'job_risks' para que coincida con la plantilla
            risks: profile.job_risks
        };

        // 3. Renderizar el documento
        doc.setData(data);
        doc.render();

        // 4. Generar y enviar el buffer del archivo
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        const fileName = `Ficha_Puesto_${profile.position_name}.docx`;
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(buf);

    } catch (error) {
        console.error('Error al generar el documento Word:', error);
        res.status(500).json({ message: 'Error en el servidor al generar el documento.' });
    }
};