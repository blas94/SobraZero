import { Router } from "express";
import Comercio from "../models/comercio.js";
import { middlewareAutenticacion } from "../middlewares/autenticacion.js";


const router = Router();

// Función para geocodificar dirección usando Mapbox
const geocodificarDireccion = async (direccion) => {
  const token = process.env.MAPBOX_TOKEN || "pk.eyJ1IjoidG9tYXNtaXNyYWhpIiwiYSI6ImNtaDJwZDkwaDJ1eW0yd3B5eDZ6b3Y1djMifQ.44qXpnbdv09ro4NME7QxJQ";
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

// GET /comercios - Listar solo comercios activos y aprobados (público)
router.get("/", async (_req, res) => {
  try {
    const comercios = await Comercio.find({
      activo: true,
      estadoAprobacion: "aprobado",
    });
    res.json(comercios);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /comercios/mis-comercios - Obtener comercios del usuario autenticado
router.get("/mis-comercios", middlewareAutenticacion, async (req, res) => {
  try {
    const comercios = await Comercio.find({
      propietarioId: req.usuario.uid,
    });

    res.json(comercios);
  } catch (e) {
    console.error("Error en /mis-comercios:", e);
    res.status(500).json({ message: e.message });
  }
});

// GET /comercios/:id - Obtener un comercio específico
router.get("/:id", async (req, res) => {
  try {
    const comercio = await Comercio.findById(req.params.id);

    if (!comercio) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    res.json(comercio);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /comercios - Registrar nuevo comercio (requiere autenticación)
router.post("/", middlewareAutenticacion, async (req, res) => {
  try {
    const { direccion, ...restoData } = req.body;

    // Verificar que el usuario no tenga ya un comercio
    const comercioExistente = await Comercio.findOne({
      propietarioId: req.usuario.uid,
    });

    if (comercioExistente) {
      return res.status(400).json({
        message: "Ya tenés un comercio registrado",
      });
    }

    // Geocodificar dirección para obtener coordenadas
    const coordenadas = await geocodificarDireccion(direccion);

    // Crear comercio con estado pendiente de revisión
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

    res.status(201).json(nuevo);
  } catch (e) {
    console.error("Error al crear comercio:", e);
    res.status(400).json({
      message: "Error al crear comercio",
      error: e.message,
    });
  }
});

// PUT /comercios/:id - Editar comercio (requiere autenticación y ser propietario)
router.put("/:id", middlewareAutenticacion, async (req, res) => {
  try {
    const comercio = await Comercio.findById(req.params.id);

    if (!comercio) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    // Verificar que el usuario sea el propietario
    if (comercio.propietarioId?.toString() !== req.usuario.uid) {
      return res.status(403).json({
        message: "No tenés permisos para editar este comercio",
      });
    }

    // No permitir cambiar estadoAprobacion ni propietarioId
    const { estadoAprobacion, propietarioId, ...datosActualizables } = req.body;

    // Si se está actualizando la dirección, geocodificar
    if (datosActualizables.direccion) {
      const coordenadas = await geocodificarDireccion(datosActualizables.direccion);
      datosActualizables.coordenadas = coordenadas;
    }

    const updated = await Comercio.findByIdAndUpdate(
      req.params.id,
      datosActualizables,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE /comercios/:id - Eliminar comercio (requiere autenticación y ser propietario)
router.delete("/:id", middlewareAutenticacion, async (req, res) => {
  try {
    const comercio = await Comercio.findById(req.params.id);

    if (!comercio) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    // Verificar que el usuario sea el propietario
    if (comercio.propietarioId?.toString() !== req.usuario.uid) {
      return res.status(403).json({
        message: "No tenés permisos para eliminar este comercio",
      });
    }

    const deleted = await Comercio.findByIdAndDelete(req.params.id);

    res.json({
      ok: true,
      message: "Comercio eliminado correctamente",
      deleted,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /comercios/__debug/init - Inicializar comercios existentes (debug)
router.post("/__debug/init", async (_req, res) => {
  try {
    // Migrar comercios sin estadoAprobacion
    const r = await Comercio.updateMany(
      { estadoAprobacion: { $exists: false } },
      {
        $set: {
          estadoAprobacion: "aprobado",
          activo: true
        }
      }
    );

    res.json({
      ok: true,
      mensaje: "Comercios legacy migrados exitosamente",
      matched: r.matchedCount ?? r.nMatched,
      modified: r.modifiedCount ?? r.nModified,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
