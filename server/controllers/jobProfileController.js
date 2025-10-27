// server/controllers/jobProfileController.js
const JobProfile = require('../models/jobProfileModel');
const User = require('../models/userModel'); // Necesitamos el modelo User para verificar la jerarquía

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