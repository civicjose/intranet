// server/controllers/userController.js
const crypto = require("crypto");
const User = require("../models/userModel");
const Department = require("../models/departmentModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.getUserProfile = async (req, res, next) => {
  if (!req.user) {
    return res.status(404).json({ message: "Usuario no encontrado." });
  }
  try {
    const userProfileData = await User.findById(req.user.id);
    const departments = await Department.findByUserId(req.user.id);
    const is_supervisor = await User.isSupervisor(req.user.id);

    if (!userProfileData) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const userProfile = {
        ...userProfileData,
        departments: departments,
        is_supervisor: is_supervisor
    };

    res.status(200).json(userProfile);
  } catch (error) {
    next(error);
  }
};

exports.getMyTeam = async (req, res, next) => {
    try {
        const teamMembers = await User.findSubordinatesBySupervisorId(req.user.id);
        res.status(200).json(teamMembers);
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  const { email, firstName, lastName, role_id } = req.body;

  if (!email || !firstName || !lastName || !role_id) {
    res.status(400);
    return next(new Error("Faltan campos requeridos: email, nombre, apellidos y rol."));
  }

  try {
    const userExists = await User.findByEmail(email);
    if (userExists) {
      res.status(400);
      throw new Error("El usuario con este email ya existe.");
    }

    if (req.body.creationMethod === 'direct' && req.body.password) {
      await User.adminCreateWithPassword(req.body);
      res.status(201).json({ message: "Usuario creado directamente con éxito." });
    } else {
      const setupToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(setupToken).digest("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await User.adminCreate(req.body, { hashedCode: hashedToken, expiresAt });
      
      const setupUrl = `${process.env.FRONTEND_URL}/complete-profile?token=${setupToken}`;
      
      await transporter.sendMail({
        from: `"Intranet Macrosad" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Completa tu perfil en la Intranet de Macrosad",
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Bienvenido/a a la Intranet</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Poppins, Arial, sans-serif; background-color: #f4f7f6;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px auto;">
            <tr>
              <td align="center" style="padding: 40px 20px 30px 20px; background-color: #6c3b5d; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0;">¡Bienvenido/a, ${firstName}!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <p style="color: #333333; font-size: 16px; margin: 0 0 30px 0;">Un administrador ha creado una cuenta para ti. Por favor, haz clic en el siguiente botón para completar tu perfil y establecer tu contraseña. El enlace es válido durante 24 horas.</p>
                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${setupUrl}" style="background-color: #e5007e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Completar Perfil
                  </a>
                </div>
                <p style="color: #555555; font-size: 14px; margin: 0;">Si el botón no funciona, copia y pega la siguiente URL en tu navegador:</p>
                <p style="color: #e5007e; font-size: 12px; margin: 5px 0 0 0; word-break: break-all;">${setupUrl}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 12px 12px;">
                <p style="color: #888888; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Macrosad. Todos los derechos reservados.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      });      
      res.status(201).json({ message: "Usuario invitado exitosamente. Se ha enviado un correo." });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role_id } = req.body;
    if (!firstName || !lastName || !email || !role_id) {
      res.status(400);
      throw new Error("Faltan campos requeridos: nombre, apellidos, email y rol.");
    }
    await User.update(id, req.body);
    res.status(200).json({ message: "Usuario actualizado correctamente." });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userIdToDelete = req.params.id;
    const adminUserId = req.user.id;
    if (userIdToDelete == adminUserId) {
      res.status(400);
      throw new Error("No puedes eliminar tu propia cuenta de administrador.");
    }
    const user = await User.findById(userIdToDelete);
    if (!user) {
      res.status(404);
      throw new Error("Usuario no encontrado.");
    }
    await User.delete(userIdToDelete);
    res.status(200).json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("Usuario no encontrado.");
    }
    const dataToUpdate = {
      firstName: req.body.firstName || user.first_name,
      lastName: req.body.lastName || user.last_name,
      companyPhone: req.body.companyPhone || user.company_phone,
      birthDate: req.body.birthDate || user.birth_date,
    };
    await User.updateProfile(req.user.id, dataToUpdate);
    res.status(200).json({ message: "Perfil actualizado correctamente." });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No se ha subido ningún archivo.");
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    await User.updateAvatar(req.user.id, avatarUrl);
    res.status(200).json({ message: "Imagen subida correctamente.", avatarUrl });
  } catch (error) {
    next(error);
  }
};

exports.reorderUsers = async (req, res, next) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: 'Se esperaba un array de IDs.' });
    }
    try {
        await User.reorder(orderedIds);
        res.status(200).json({ message: 'Orden de usuarios actualizado correctamente.' });
    } catch (error) {
        next(error);
    }
};