import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.js";
import { obtenerCoordenadas } from "../utils/geocodificacion.js";
import crypto from "crypto";
import { enviarCorreoRecuperacion, enviarCorreoCambioEmail } from "../utils/email.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_cambia_esto";


function getAuthPayload(req) {
  // 1. Intentar header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      return jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    } catch {
      // Token inválido en header, seguimos probando cookies
    }
  }

  // 2. Leer token desde cookie HttpOnly (fallback)
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function convertirAGeoJSON(latitud, longitud) {
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return undefined;
  return { type: "Point", coordinates: [longitud, latitud] };
}


async function construirUbicacion(entrada) {
  if (entrada && typeof entrada === "object" && ("latitud" in entrada || "longitud" in entrada)) {
    const lat = Number(entrada.latitud);
    const lng = Number(entrada.longitud);
    const direccion = (entrada.direccion || "").toString().trim();

    return {
      ubicacionTexto: direccion,
      ubicacionGeo: convertirAGeoJSON(lat, lng),
    };
  }

  if (typeof entrada === "string") {
    const datos = await obtenerCoordenadas(entrada.trim());
    if (datos) {
      return {
        ubicacionTexto: datos.direccion,
        ubicacionGeo: convertirAGeoJSON(datos.latitud, datos.longitud),
      };
    }

    return { ubicacionTexto: entrada.trim(), ubicacionGeo: undefined };
  }

  return { ubicacionTexto: "", ubicacionGeo: undefined };
}


router.post("/register", async (req, res) => {
  try {
    const { nombre, email, clave, tel, ubicacion } = req.body || {};

    if (!nombre?.trim() || !email?.trim() || !clave?.trim() || !tel?.trim() || typeof ubicacion === "undefined") {
      return res.status(400).json({ error: "Completá nombre, email, clave, teléfono y ubicación." });
    }

    const existente = await Usuario.findOne({ email: email.trim() });
    if (existente) return res.status(409).json({ error: "El email ya está registrado" });

    const claveHash = await bcrypt.hash(clave, 10);

    const { ubicacionTexto, ubicacionGeo } = await construirUbicacion(ubicacion);

    const user = await Usuario.create({
      nombre: nombre.trim(),
      email: email.trim(),
      clave: claveHash,
      tel: tel.trim(),
      ubicacionTexto,
      ...(ubicacionGeo ? { ubicacionGeo } : {}),
    });

    const token = jwt.sign({ uid: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    // Enviar token como cookie HttpOnly (Compatibilidad)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' permite cross-site (Vercel -> Render)
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    return res.status(201).json({
      token, // Devolvemos el token para uso en localStorage (Bearer)
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        email: user.email,
        tel: user.tel,
        ubicacion: user.ubicacionTexto,
        avatar: user.avatar,
        vioTutorial: user.vioTutorial,
        ubicacionCoords: user.ubicacionGeo?.coordinates ?? null,
      },
    });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: "El email ya está registrado" });
    console.error("Register error:", e);
    return res.status(500).json({ error: "No se pudo registrar" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, clave } = req.body || {};
    if (!email?.trim() || !clave?.trim()) {
      return res.status(400).json({ error: "Email y clave requeridos" });
    }

    const user = await Usuario.findOne({ email: email.trim() });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(clave, user.clave);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ uid: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    // Enviar token como cookie HttpOnly (Compatibilidad)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' permite cross-site (Vercel -> Render)
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    return res.json({
      token, // Devolvemos el token para uso en localStorage (Bearer)
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        email: user.email,
        tel: user.tel,
        ubicacion: user.ubicacionTexto,
        avatar: user.avatar,
        vioTutorial: user.vioTutorial,
        ubicacionCoords: user.ubicacionGeo?.coordinates ?? null,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
});

router.get("/me", async (req, res) => {
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "No autorizado" });

  const user = await Usuario.findById(payload.uid).select(
    "_id nombre email tel ubicacionTexto ubicacionGeo avatar vioTutorial"
  );
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  return res.json({
    id: user._id.toString(),
    nombre: user.nombre,
    email: user.email,
    tel: user.tel,
    ubicacion: user.ubicacionTexto,
    avatar: user.avatar,
    vioTutorial: user.vioTutorial,
    ubicacionCoords: user.ubicacionGeo?.coordinates ?? null,
  });
});

router.put("/me", async (req, res) => {
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "No autorizado" });

  const { nombre, tel, ubicacion, avatar } = req.body || {};
  const actualizacion = {};

  if (typeof nombre === "string" && nombre.trim()) actualizacion.nombre = nombre.trim();
  if (typeof tel === "string") actualizacion.tel = tel.trim();
  // Permitir avatar null para eliminación de foto
  if (avatar !== undefined) {
    actualizacion.avatar = avatar === null ? null : avatar;
  }


  if (typeof ubicacion !== "undefined") {
    const { ubicacionTexto, ubicacionGeo } = await construirUbicacion(ubicacion);
    actualizacion.ubicacion = ubicacionTexto;
    actualizacion.ubicacionTexto = ubicacionTexto;
    actualizacion.ubicacionGeo = ubicacionGeo;
  }

  const user = await Usuario.findByIdAndUpdate(
    payload.uid,
    { $set: actualizacion },
    { new: true, runValidators: true, fields: "_id nombre email tel ubicacionTexto ubicacionGeo avatar vioTutorial" }
  );

  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  return res.json({
    id: user._id.toString(),
    nombre: user.nombre,
    email: user.email,
    tel: user.tel,
    ubicacion: user.ubicacionTexto,
    avatar: user.avatar,
    vioTutorial: user.vioTutorial,
    ubicacionCoords: user.ubicacionGeo?.coordinates ?? null,
  });
});

// Logout - Limpiar cookie de múltiples formas para asegurar borrado
router.post("/logout", (req, res) => {
  // 1. Instancia Segura (Prod/Dev)
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  });

  // 2. Instancia Fallback (por si acaso quedó una vieja sin secure)
  res.clearCookie("token", {
    path: "/"
  });

  return res.json({ message: "Sesión cerrada exitosamente" });
});

// Verificar autenticación
router.get("/verificar", async (req, res) => {
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ autenticado: false });

  const user = await Usuario.findById(payload.uid).select(
    "_id nombre email tel ubicacionTexto ubicacionGeo avatar vioTutorial"
  );
  if (!user) return res.status(404).json({ autenticado: false });

  return res.json({
    autenticado: true,
    user: {
      id: user._id.toString(),
      nombre: user.nombre,
      email: user.email,
      tel: user.tel,
      ubicacion: user.ubicacionTexto,
      avatar: user.avatar,
      vioTutorial: user.vioTutorial,
      ubicacionCoords: user.ubicacionGeo?.coordinates ?? null,
    },
  });
});

// Actualizar estado de Tutorial (visto)
router.post("/tutorial", async (req, res) => {
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "No autorizado" });
  try {
    const user = await Usuario.findByIdAndUpdate(
      payload.uid,
      { vioTutorial: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json({ success: true, vioTutorial: user.vioTutorial });
  } catch (e) {
    console.error("Error updating tutorial:", e);
    return res.status(500).json({ error: "Error al actualizar estado" });
  }
});

// --- RECUPERACIÓN DE CONTRASEÑA ---

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const user = await Usuario.findOne({ email });
    if (!user) return res.status(404).json({ error: "No existe un usuario con ese email" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const enviado = await enviarCorreoRecuperacion(user.email, user.nombre, token);
    if (!enviado) return res.status(500).json({ error: "Error enviando correo" });

    res.json({ message: "Correo de recuperación enviado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Datos incompletos" });

    const user = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) return res.status(400).json({ error: "Token inválido o expirado" });

    user.clave = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Contraseña restablecida correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// --- CAMBIO DE EMAIL ---

router.post("/request-email-change", async (req, res) => {
  try {
    const payload = getAuthPayload(req);
    if (!payload) return res.status(401).json({ error: "No autorizado" });

    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ error: "Nuevo email requerido" });

    const existe = await Usuario.findOne({ email: newEmail });
    if (existe) return res.status(409).json({ error: "El email ya está en uso" });

    const user = await Usuario.findById(payload.uid);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const token = crypto.randomBytes(20).toString("hex");
    user.emailChangeToken = token;
    user.emailChangeExpires = Date.now() + 3600000;
    user.newEmailPending = newEmail;
    await user.save();

    await enviarCorreoCambioEmail(newEmail, user.nombre, token);

    res.json({ message: "Se ha enviado un correo de confirmación a tu nueva dirección" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en el servidor: " + e.message });
  }
});

router.post("/verify-email-change", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token requerido" });

    const user = await Usuario.findOne({
      emailChangeToken: token,
      emailChangeExpires: { $gt: Date.now() },
    }).select("+emailChangeToken +emailChangeExpires +newEmailPending");

    if (!user) return res.status(400).json({ error: "Token inválido o expirado" });

    // Verificar doble check de unicidad por si acaso
    const existe = await Usuario.findOne({ email: user.newEmailPending });
    if (existe && existe._id.toString() !== user._id.toString()) {
      return res.status(409).json({ error: "El email ya fue ocupado por otro usuario mientras esperabas" });
    }

    user.email = user.newEmailPending;
    user.emailChangeToken = undefined;
    user.emailChangeExpires = undefined;
    user.newEmailPending = undefined;
    await user.save();

    // Opcional: Invalidar sesiones viejas (cambio de email altera el JWT payload si se regenera)
    // Por ahora solo confirmamos cambio.

    res.json({ message: "Email actualizado correctamente. Por favor inicia sesión nuevamente." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
