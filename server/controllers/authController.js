const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Configuración del transporter de Nodemailer para usar con tu dominio
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true si el puerto es 465, false para otros
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @desc    Verifica si un email existe. Si es nuevo o no verificado, envía un código.
 * @route   POST /api/auth/check-email
 * @access  Public
 */
exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "El campo de email es requerido." });
  }

  try {
    // --- Validación de Dominio desde la Base de Datos ---
    // 1. Obtenemos todos los dominios activos.
    const [allowedDomainsRows] = await db.query(
      "SELECT domain_name FROM allowed_domains WHERE is_active = TRUE"
    );
    const allowedDomains = allowedDomainsRows.map((row) => row.domain_name);

    // 2. Extraemos el dominio del email del usuario.
    const domain = email.split("@")[1];

    // 3. Comprobamos si el dominio está en la lista permitida.
    if (!allowedDomains.includes(domain)) {
      return res.status(403).json({
        message: "No puedes acceder si no dispones de un correo corporativo.",
      });
    }
    // -----------------------------------------------------------------

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    // Si el usuario existe y ya está verificado, le pedimos la contraseña
    if (user && user.is_verified) {
      return res.status(200).json({ status: "user_exists" });
    }

    // Para usuarios nuevos o existentes no verificados, se genera/actualiza el código
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(verificationCode, salt);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // El código expira en 2 minutos

    if (user && !user.is_verified) {
      // Actualiza el código para el usuario existente no verificado
      await db.query(
        "UPDATE users SET verification_code = ?, verification_code_expires_at = ? WHERE email = ?",
        [hashedCode, expiresAt, email]
      );
    } else {
      // Inserta el nuevo usuario con el código
      await db.query(
        "INSERT INTO users (email, verification_code, verification_code_expires_at) VALUES (?, ?, ?)",
        [email, hashedCode, expiresAt]
      );
    }

    // Prepara y envía el correo electrónico de verificación
    const mailOptions = {
      from: `"Intranet Macrosad" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Tu código de verificación para la Intranet Macrosad",
      html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Código de Verificación</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Poppins, Arial, sans-serif; background-color: #f4f7f6;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <tr>
                <td align="center" style="padding: 40px 20px 30px 20px; background-color: #6c3b5d; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Verificación de Correo</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333333; font-size: 16px; margin: 0 0 20px 0;">Hola,</p>
                  <p style="color: #333333; font-size: 16px; margin: 0 0 30px 0;">Usa el siguiente código para completar tu registro. El código es válido durante 2 minutos.</p>
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <span style="display: inline-block; background-color: #f2f2f2; color: #e5007e; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 15px 25px; border-radius: 8px; border: 1px dashed #dddddd;">
                      ${verificationCode}
                    </span>
                  </div>
                  
                  <p style="color: #333333; font-size: 16px; margin: 0;">Si no has solicitado este código, puedes ignorar este correo electrónico de forma segura.</p>
                </td>
              </tr>
              
              <tr>
                <td align="center" style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 12px 12px;">
                  <p style="color: #888888; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Macrosad. Todos los derechos reservados.</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a ${email}`);

    return res.status(201).json({ status: "verification_sent" });
  } catch (error) {
    console.error("Error en checkEmail:", error);
    return res.status(500).json({ message: "Error del servidor." });
  }
};

/**
 * @desc    Verifica el código de 6 dígitos
 * @route   POST /api/auth/verify-code
 * @access  Public
 */
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res
      .status(400)
      .json({ message: "El email y el código son requeridos." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    // Comprueba si el usuario existe y no está verificado
    if (!user || user.is_verified) {
      return res.status(400).json({ message: "Petición inválida." });
    }

    // Comprueba si el código ha expirado
    if (new Date() > new Date(user.verification_code_expires_at)) {
      return res
        .status(400)
        .json({ message: "El código de verificación ha expirado." });
    }

    const isMatch = await bcrypt.compare(code, user.verification_code);

    if (isMatch) {
      return res.status(200).json({ status: "code_verified" });
    } else {
      return res
        .status(400)
        .json({ status: "invalid_code", message: "Código incorrecto." });
    }
  } catch (error) {
    console.error("Error en verifyCode:", error);
    return res.status(500).json({ message: "Error del servidor." });
  }
};

/**
 * @desc    Completa el registro con contraseña y datos personales
 * @route   POST /api/auth/complete-registration
 * @access  Public
 */
exports.completeRegistration = async (req, res) => {
    // 1. Eliminamos 'departmentId' de los datos que esperamos recibir
    const { email, password, firstName, lastName, companyPhone, birthDate } = req.body;

    // 2. Eliminamos 'departmentId' de la comprobación de campos requeridos
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    // Regex: Mínimo 8 caracteres, al menos una letra y un número.
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.' 
        });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || user.is_verified) {
            return res.status(400).json({ message: 'Petición inválida o el usuario ya está verificado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. La consulta UPDATE ya no incluye 'department_id'
        const query = `
            UPDATE users SET 
                password = ?, first_name = ?, last_name = ?, 
                company_phone = ?, birth_date = ?, 
                is_verified = TRUE, verification_code = NULL, verification_code_expires_at = NULL
            WHERE email = ?
        `;
        await db.query(query, [hashedPassword, firstName, lastName, companyPhone, birthDate, email]);
        
        const [updatedUserRows] = await db.query('SELECT id, role_id FROM users WHERE email = ?', [email]);
        const updatedUser = updatedUserRows[0];

        const payload = {
            id: updatedUser.id,
            role: updatedUser.role_id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

        return res.status(200).json({
            status: 'registration_complete',
            token: token
        });
    } catch (error) {
        console.error('Error en completeRegistration:', error);
        return res.status(500).json({ message: 'Error del servidor.' });
    }
};

/**
 * @desc    Autentica un usuario y obtiene un token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    if (!user.is_verified) {
      return res
        .status(401)
        .json({ message: "La cuenta no ha sido verificada." });
    }

    const payload = {
      id: user.id,
      role: user.role_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    return res.status(200).json({
      status: "login_success",
      token: token,
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    return res.status(500).json({ message: "Error del servidor." });
  }
};
