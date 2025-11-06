// server/controllers/authController.js
const crypto = require('crypto');
const User = require('../models/userModel');
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

exports.checkEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "El campo de email es requerido." });
  }
  try {
    const [allowedDomainsRows] = await db.query(
      "SELECT domain_name FROM allowed_domains WHERE is_active = TRUE"
    );
    const allowedDomains = allowedDomainsRows.map((row) => row.domain_name);
    const domain = email.split("@")[1];
    if (!allowedDomains.includes(domain)) {
      return res.status(403).json({
        message: "No puedes acceder si no dispones de un correo corporativo.",
      });
    }
    const user = await User.findByEmail(email);
    if (user && user.is_verified) {
      return res.status(200).json({ status: "user_exists" });
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(verificationCode, salt);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    if (user && !user.is_verified) {
      await User.updateVerificationCode(email, hashedCode, expiresAt);
    } else if (!user) {
      await User.create(email, hashedCode, expiresAt);
    }

    const mailOptions = {
      from: `"Intranet Macrosad" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Tu código de verificación para la Intranet Macrosad",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Código de Verificación</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Poppins, Arial, sans-serif; background-color: #f4f7f6;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px auto;">
            <tr>
              <td align="center" style="padding: 40px 20px 30px 20px; background-color: #6c3b5d; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Verificación de Correo</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <p style="color: #333333; font-size: 16px; margin: 0 0 30px 0;">Usa el siguiente código para completar tu registro. El código es válido durante 2 minutos.</p>
                <div style="text-align: center; margin-bottom: 30px;">
                  <span style="display: inline-block; background-color: #f2f2f2; color: #e5007e; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 15px 25px; border-radius: 8px;">
                    ${verificationCode}
                  </span>
                </div>
                <p style="color: #333333; font-size: 16px; margin: 0;">Si no has solicitado este código, puedes ignorar este correo.</p>
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
    };
    await transporter.sendMail(mailOptions);
    return res.status(201).json({ status: "verification_sent" });
  } catch (error) {
    next(error);
  }
};

exports.verifyCode = async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "El email y el código son requeridos." });
  }
  try {
    const user = await User.findByEmail(email);
    if (!user || user.is_verified) {
      return res.status(400).json({ message: "Petición inválida." });
    }
    if (new Date() > new Date(user.verification_code_expires_at)) {
      return res.status(400).json({ message: "El código de verificación ha expirado." });
    }
    const isMatch = await bcrypt.compare(code, user.verification_code);
    if (isMatch) {
      return res.status(200).json({ status: "code_verified" });
    } else {
      return res.status(400).json({ status: "invalid_code", message: "Código incorrecto." });
    }
  } catch (error) {
    next(error);
  }
};

exports.completeRegistration = async (req, res, next) => {
    const { token, email, password, firstName, lastName, companyPhone, birthDate } = req.body;

    if ((!token && !email) || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.' });
    }

    try {
        let user;
        if (token) {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            user = await User.findByVerificationCode(hashedToken);
        } else {
            user = await User.findByEmail(email);
        }
        
        if (!user || user.is_verified) {
            return res.status(400).json({ message: 'Petición inválida, el enlace no es válido o el usuario ya está verificado.' });
        }
        if (new Date() > new Date(user.verification_code_expires_at)) {
            return res.status(400).json({ message: 'El enlace para completar el perfil ha expirado.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.setPasswordAndProfile(user.id, { hashedPassword, firstName, lastName, companyPhone, birthDate });
        const updatedUser = await User.findById(user.id);
        const payload = { id: updatedUser.id, role: updatedUser.role_id };
        const sessionToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
        return res.status(200).json({ status: 'registration_complete', token: sessionToken });
    } catch (error) {
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos." });
  }
  try {
    const user = await User.findByEmail(email);
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }
    if (!user.is_verified) {
      return res.status(401).json({ message: "La cuenta no ha sido verificada." });
    }
    const payload = { id: user.id, role: user.role_id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    return res.status(200).json({ status: "login_success", token: token });
  } catch (error) {
    next(error);
  }
};

exports.getSetupInfo = async (req, res, next) => {
    const { token } = req.query; // El token viene en la URL (ej: ?token=...)

    if (!token) {
        res.status(400);
        return next(new Error('Falta el token de configuración.'));
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findByVerificationCode(hashedToken);

        // Valida que el token exista y no haya expirado
        if (!user || new Date() > new Date(user.verification_code_expires_at)) {
            res.status(400);
            throw new Error('El enlace no es válido o ha expirado.');
        }

        // Si es válido, devuelve los datos que el admin ya rellenó
        res.status(200).json({
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Gestiona la solicitud de "Olvidé mi contraseña".
 * Genera un token y envía un email al usuario.
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);

        // Importante: Enviamos una respuesta de éxito incluso si el usuario no existe
        // para no revelar qué correos están registrados en el sistema (seguridad).
        if (!user) {
            return res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace para recuperar tu contraseña.' });
        }

        // 1. Generar un token aleatorio
        const resetToken = crypto.randomBytes(32).toString('hex');

        // 2. Hashear el token antes de guardarlo en la BD por seguridad
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // 3. Establecer fecha de expiración (ej: 1 hora)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // 4. Guardar el token hasheado y la expiración en el usuario
        await User.savePasswordResetToken(user.id, hashedToken, expiresAt);

        // 5. Crear el enlace de reseteo (enviamos el token SIN hashear en el enlace)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // 6. Enviar el correo
        await transporter.sendMail({
            from: `"Intranet Macrosad" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Recuperación de Contraseña",
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <title>Recuperación de Contraseña</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Poppins, Arial, sans-serif; background-color: #f4f7f6;">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px auto;">
                    <tr>
                      <td align="center" style="padding: 40px 20px 30px 20px; background-color: #6c3b5d; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Recuperación de Contraseña</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="color: #333333; font-size: 16px; margin: 0 0 15px 0;">Hola ${user.first_name},</p>
                        <p style="color: #333333; font-size: 16px; margin: 0 0 30px 0;">Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar. Este enlace es válido durante 1 hora.</p>
                        <div style="text-align: center; margin-bottom: 30px;">
                          <a href="${resetUrl}" style="display: inline-block; background-color: #e5007e; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 25px; border-radius: 8px;">
                            Restablecer Contraseña
                          </a>
                        </div>
                        <p style="color: #333333; font-size: 16px; margin: 0;">Si no has solicitado este cambio, puedes ignorar este correo de forma segura.</p>
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

        res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace para recuperar tu contraseña.' });

    } catch (error) {
        next(error);
    }
};

/**
 * Restablece la contraseña usando el token.
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // 1. Hashear el token recibido para buscarlo en la BD
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // 2. Buscar usuario con ese token y que no haya expirado
        const user = await User.findByPasswordResetToken(hashedToken);

        if (!user) {
            res.status(400);
            return next(new Error('El token no es válido o ha expirado.'));
        }

        // 3. Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Actualizar la contraseña en la BD y limpiar los campos de reseteo
        await User.resetPassword(user.id, hashedPassword);
        
        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        next(error);
    }
};