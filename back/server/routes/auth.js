import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.js";
import { obtenerCoordenadas } from "../utils/geocodificacion.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_cambia_esto";


function getAuthPayload(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
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

    return res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        email: user.email,
        tel: user.tel,
        ubicacion: user.ubicacionTexto,
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

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        email: user.email,
        tel: user.tel,
        ubicacion: user.ubicacionTexto,
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
    "_id nombre email tel ubicacionTexto ubicacionGeo"
  );
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  return res.json({
    id: user._id.toString(),
    nombre: user.nombre,
    email: user.email,
    tel: user.tel,
    ubicacion: user.ubicacionTexto,
    ubicacionCoords: user.ubicacionGeo?.coordinates ?? null,
  });
});

router.put("/me", async (req, res) => {
  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "No autorizado" });

  const { nombre, tel, ubicacion } = req.body || {};
  const actualizacion = {};

  if (typeof nombre === "string" && nombre.trim()) actualizacion.nombre = nombre.trim();
  if (typeof tel === "string") actualizacion.tel = tel.trim();


  if (typeof ubicacion !== "undefined") {
    const { ubicacionTexto, ubicacionGeo } = await construirUbicacion(ubicacion);
    actualizacion.ubicacion = ubicacionTexto;  
    actualizacion.ubicacionTexto = ubicacionTexto;
    actualizacion.ubicacionGeo = ubicacionGeo;
}

  const user = await Usuario.findByIdAndUpdate(
    payload.uid,
    { $set: actualizacion },
    { new: true, runValidators: true, fields: "_id nombre email tel ubicacionTexto ubicacionGeo" }
  );

  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  return res.json({
    id: user._id.toString(),
    nombre: user.nombre,
    email: user.email,
    tel: user.tel,
    ubicacion: user.ubicacionTexto,
    ubicacionCoords: user.ubicacionGeo?.coordinates ?? null,
  });
});

export default router;
