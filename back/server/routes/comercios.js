import { Router } from "express";
import Comercio from "../models/comercio.js";

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

router.get("/", async (_req, res) => {
  try {
    const comercios = await Comercio.find();
    res.json(comercios);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

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

router.post("/", async (req, res) => {
  try {
    const { direccion, ...restoData } = req.body;

    // Geocodificar dirección para obtener coordenadas
    const coordenadas = await geocodificarDireccion(direccion);

    // Crear comercio con coordenadas
    const nuevo = await Comercio.create({
      ...restoData,
      direccion,
      coordenadas,
      activo: true,
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

router.put("/:id", async (req, res) => {
  try {
    const updated = await Comercio.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Comercio.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    res.json({
      ok: true,
      message: "Comercio eliminado correctamente",
      deleted,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/__debug/init", async (_req, res) => {
  try {
    const r = await Comercio.updateMany(
      { activo: { $exists: false } },
      { $set: { activo: true } }
    );

    res.json({
      ok: true,
      matched: r.matchedCount ?? r.nMatched,
      modified: r.modifiedCount ?? r.nModified,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
