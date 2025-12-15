import nodemailer from "nodemailer";

// Transporter perezoso para esperar a que dotenv cargue las variables
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    console.log("🔧 Creando transporter de email...");
    console.log("📧 EMAIL_USER:", process.env.EMAIL_USER ? "✅ Configurado" : "❌ No configurado");
    console.log("🔑 EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Configurado" : "❌ No configurado");

    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Permite certificados autofirmados en desarrollo
      },
      connectionTimeout: 10000, // 10 segundos
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
};

export const enviarCorreo = async (destinatario, asunto, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Faltan credenciales de email en .env (EMAIL_USER, EMAIL_PASS)");
    throw new Error("Credenciales de email no configuradas en el servidor (EMAIL_USER/EMAIL_PASS faltantes).");
  }

  try {
    console.log(`📤 Intentando enviar correo a: ${destinatario}`);
    const info = await getTransporter().sendMail({
      from: `"SobraZero" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: html,
    });
    console.log("✅ Correo enviado exitosamente:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error enviando correo:", error.message);
    console.error("❌ Código de error:", error.code);
    console.error("❌ Comando:", error.command);

    // Mensajes de error más específicos
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      throw new Error("Timeout de conexión con Gmail. Verifica las credenciales y que Gmail permita el acceso.");
    } else if (error.code === 'EAUTH') {
      throw new Error("Autenticación fallida. Verifica EMAIL_USER y EMAIL_PASS (debe ser App Password de Gmail).");
    } else {
      throw new Error(error.message || "Fallo al enviar el correo a través del proveedor.");
    }
  }
};

export const enviarCorreoRecuperacion = async (email, nombre, token) => {
  const url = `${process.env.CLIENT_URL || "http://localhost:5173"}/restablecer-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      <h2 style="color: #2F5C3E;">Recuperar Contraseña</h2>
      <p style="text-align: left;">Hola ${nombre},</p>
      <p style="text-align: left;">Has solicitado restablecer tu contraseña en SobraZero.</p>
      <p style="text-align: left;">Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <div style="margin: 30px 0;">
        <a href="${url}" style="background-color: #2F5C3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
      </div>
      <p style="text-align: left;">Este enlace expirará en 1 hora.</p>
      <p style="text-align: left;">Si no solicitaste esto, ignora este correo.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">SobraZero - Ahorrá y evitá el excedente de comida.</p>
    </div>
  `;

  return enviarCorreo(email, "Recuperación de Contraseña - SobraZero", html);
};

export const enviarCorreoCambioEmail = async (emailNuevo, nombre, token) => {
  const url = `${process.env.CLIENT_URL || "http://localhost:5173"}/verificar-cambio-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      <h2 style="color: #2F5C3E;">Confirmar Cambio de Email</h2>
      <p style="text-align: left;">Hola ${nombre},</p>
      <p style="text-align: left;">Has solicitado cambiar tu dirección de correo electrónico en SobraZero a esta cuenta.</p>
      <p style="text-align: left;">Para confirmar este cambio, haz clic en el siguiente enlace:</p>
      <div style="margin: 30px 0;">
        <a href="${url}" style="background-color: #2F5C3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Confirmar Nuevo Email</a>
      </div>
      <p style="text-align: left;">Este enlace expirará en 1 hora.</p>
      <p style="text-align: left;">Si no fuiste tú, por favor contacta a soporte.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">SobraZero - Ahorrá y evitá el excedente de comida.</p>
    </div>
  `;

  return enviarCorreo(emailNuevo, "Confirmar Cambio de Email - SobraZero", html);
};
