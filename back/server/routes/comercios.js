import { Router } from "express";
import Comercio from "../models/comercio.js";
import { middlewareAutenticacion } from "../middlewares/autenticacion.js";

const router = Router();

/**
 * FLAGS de compatibilidad "vieja" (CRUD sin auth)
 * Por defecto: OFF (seguro)
 *
 * Si necesitás que el comportamiento viejo siga funcionando:
 * - ALLOW_LEGACY_COMERCIOS_READ_ALL=true     (GET /comercios?all=1)
 * - ALLOW_LEGACY_COMERCIOS_WRITE=true        (POST/PUT/DELETE sin auth)
 */
const ALLOW_LEGACY_COMERCIOS_READ_ALL =
  String(process.env.ALLOW_LEGACY_COMERCIOS_READ_ALL || "").toLowerCase() === "true";

const ALLOW_LEGACY_COMERCIOS_WRITE =
  String(process.env.ALLOW_LEGACY_COMERCIOS_WRITE || "").toLowerCase() === "true";

// -----------------------------
// Utilidad compartida: geocodificación
// -----------------------------
const geocodificarDireccion = async (direccion) => {
  const token =
    process.env.MAPBOX_TOKEN ||
    "pk.eyJ1IjoidG9tYXNtaXNyYWhpIiwiYSI6ImNtaDJwZDkwaDJ1eW0yd3B5eDZ6b3Y1djMifQ.44qXpnbdv09ro4NME7QxJQ";

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    direccion
  )}.json?access_token=${token}&country=ar&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }

    throw new Error("No se pudo geocodificar la dirección");
  } catch (error) {
    console.error("Error geocodificando:", error);
    throw new Error("Error al obtener coordenadas de la dirección");
  }
};

// -----------------------------
// GET /comercios (PÚBLICO)
// - PRO: solo activo + aprobado
// - LEGACY opcional: si viene ?all=1 y el flag está prendido, devuelve todos
// -----------------------------
router.get("/", async (req, res) => {
  try {
    const pedirTodos = String(req.query.all || "") === "1";

    // Compatibilidad "vieja": listar todos (solo si se habilita)
    if (pedirTodos && ALLOW_LEGACY_COMERCIOS_READ_ALL) {
      const comercios = await Comercio.find();
      return res.json(comercios);
    }

    // PRO (por defecto)
    const comercios = await Comercio.find({
      activo: true,
      estadoAprobacion: "aprobado",
    });

    return res.json(comercios);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

// -----------------------------
// GET /comercios/mis-comercios (AUTENTICADO)
// - PRO: devuelve comercios del propietario logueado
// -----------------------------
router.get("/mis-comercios", middlewareAutenticacion, async (req, res) => {
  try {
    const comercios = await Comercio.find({
      propietarioId: req.usuario.uid,
    });

    return res.json(comercios);
  } catch (e) {
    console.error("Error en /mis-comercios:", e);
    return res.status(500).json({ message: e.message });
  }
});

// -----------------------------
// GET /comercios/:id (PÚBLICO)
// - PRO + LEGACY: obtener comercio por id
// -----------------------------
router.get("/:id", async (req, res) => {
  try {
    const comercio = await Comercio.findById(req.params.id);

    if (!comercio) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    return res.json(comercio);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

// -----------------------------
// POST /comercios
// - PRO: requiere auth, crea comercio para el usuario, pendiente_revision + activo false
// - LEGACY opcional: permite crear sin auth si ALLOW_LEGACY_COMERCIOS_WRITE=true
// -----------------------------
router.post("/", async (req, res, next) => {
  // Si viene auth, seguimos PRO
  const authHeader = req.headers.authorization;
  const tieneCookie = !!req.cookies?.token;

  const quierePro = !!authHeader || tieneCookie;

  if (quierePro) return middlewareAutenticacion(req, res, next);

  // Si no hay auth, solo dejamos legacy si está habilitado
  if (!ALLOW_LEGACY_COMERCIOS_WRITE) {
    return res.status(401).json({ message: "No autorizado" });
  }

  return next();
}, async (req, res) => {
  try {
    const { direccion, ...restoData } = req.body;

    if (!direccion) {
      return res.status(400).json({ message: "Dirección requerida" });
    }

    const coordenadas = await geocodificarDireccion(direccion);

    // PRO: autenticado => comercio con dueño y pendiente_revision
    if (req.usuario?.uid) {
      const comercioExistente = await Comercio.findOne({
        propietarioId: req.usuario.uid,
      });

      if (comercioExistente) {
        return res.status(400).json({ message: "Ya tenés un comercio registrado" });
      }

      const nuevo = await Comercio.create({
        ...restoData,
        direccion,
        coordenadas,
        propietarioId: req.usuario.uid,
        estadoAprobacion: "pendiente_revision",
        activo: false,
        calificacionPromedio: 0,
        totalReseñas: 0,
        productos: [],
      });

      return res.status(201).json(nuevo);
    }

    // LEGACY: sin auth => comportamiento viejo
    const nuevoLegacy = await Comercio.create({
      ...restoData,
      direccion,
      coordenadas,
      activo: true,
      calificacionPromedio: 0,
      totalReseñas: 0,
      productos: [],
    });

    return res.status(201).json(nuevoLegacy);
  } catch (e) {
    console.error("Error al crear comercio:", e);
    return res.status(400).json({
      message: "Error al crear comercio",
      error: e.message,
    });
  }
});

// -----------------------------
// PUT /comercios/:id
// - PRO: requiere auth + ser propietario
// - LEGACY opcional: permite editar sin auth si ALLOW_LEGACY_COMERCIOS_WRITE=true
// -----------------------------
router.put("/:id", async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tieneCookie = !!req.cookies?.token;
  const quierePro = !!authHeader || tieneCookie;

  if (quierePro) return middlewareAutenticacion(req, res, next);

  if (!ALLOW_LEGACY_COMERCIOS_WRITE) {
    return res.status(401).json({ message: "No autorizado" });
  }

  return next();
}, async (req, res) => {
  try {
    const comercio = await Comercio.findById(req.params.id);
    if (!comercio) return res.status(404).json({ message: "Comercio no encontrado" });

    // PRO: validar propietario
    if (req.usuario?.uid) {
      if (comercio.propietarioId?.toString() !== req.usuario.uid) {
        return res.status(403).json({ message: "No tenés permisos para editar este comercio" });
      }

      const { estadoAprobacion, propietarioId, ...datosActualizables } = req.body;

      // Validar que si se intenta activar el comercio, tenga al menos un producto
      if (datosActualizables.activo === true) {
        const productosActuales = datosActualizables.productos || comercio.productos || [];
        if (productosActuales.length === 0) {
          return res.status(400).json({
            message: "No podés activar el comercio sin tener al menos un producto registrado"
          });
        }

        // Validar que tenga alias de Mercado Pago
        const aliasActual = datosActualizables.alias !== undefined ? datosActualizables.alias : comercio.alias;
        if (!aliasActual || aliasActual.trim() === "") {
          return res.status(400).json({
            message: "No podés activar el comercio sin configurar tu alias de Mercado Pago"
          });
        }
      }

      if (datosActualizables.direccion) {
        const coordenadas = await geocodificarDireccion(datosActualizables.direccion);
        datosActualizables.coordenadas = coordenadas;
      }

      const updated = await Comercio.findByIdAndUpdate(
        req.params.id,
        datosActualizables,
        { new: true, runValidators: true }
      );

      return res.json(updated);
    }

    // LEGACY: update libre
    const updatedLegacy = await Comercio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedLegacy) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    return res.json(updatedLegacy);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

// -----------------------------
// DELETE /comercios/:id
// - PRO: requiere auth + ser propietario
// - LEGACY opcional: permite borrar sin auth si ALLOW_LEGACY_COMERCIOS_WRITE=true
// -----------------------------
router.delete("/:id", async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tieneCookie = !!req.cookies?.token;
  const quierePro = !!authHeader || tieneCookie;

  if (quierePro) return middlewareAutenticacion(req, res, next);

  if (!ALLOW_LEGACY_COMERCIOS_WRITE) {
    return res.status(401).json({ message: "No autorizado" });
  }

  return next();
}, async (req, res) => {
  try {
    const comercio = await Comercio.findById(req.params.id);
    if (!comercio) return res.status(404).json({ message: "Comercio no encontrado" });

    if (req.usuario?.uid) {
      if (comercio.propietarioId?.toString() !== req.usuario.uid) {
        return res.status(403).json({ message: "No tenés permisos para eliminar este comercio" });
      }
    }

    const deleted = await Comercio.findByIdAndDelete(req.params.id);

    return res.json({
      ok: true,
      message: "Comercio eliminado correctamente",
      deleted,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.post("/__debug/init", async (_req, res) => {
  try {
    const r = await Comercio.updateMany(
      { estadoAprobacion: { $exists: false } },
      { $set: { estadoAprobacion: "aprobado", activo: true } }
    );

    return res.json({
      ok: true,
      mensaje: "Comercios legacy migrados exitosamente",
      matched: r.matchedCount ?? r.nMatched,
      modified: r.modifiedCount ?? r.nModified,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

export default router;
