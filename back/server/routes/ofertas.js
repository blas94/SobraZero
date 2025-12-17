import { Router } from "express";
import Oferta from "../models/oferta.js";
import Comercio from "../models/comercio.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const ofertas = await Oferta.find().populate("comercio");
    res.json(ofertas);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id).populate("comercio");
    if (!oferta) {
      return res.status(404).json({ message: "Oferta no encontrada" });
    }
    res.json(oferta);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Obtener oferta por ID externo de comercio
router.get("/comercio/:idComercio", async (req, res) => {
  try {
    const { idComercio } = req.params;

    // Buscar el comercio por idExterno O por _id
    let comercio = await Comercio.findOne({ idExterno: idComercio });

    // Si no se encuentra por idExterno, intentar por _id
    if (!comercio) {
      comercio = await Comercio.findById(idComercio);
    }

    if (!comercio) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    // Buscar la oferta usando el ObjectId del comercio
    const oferta = await Oferta.findOne({
      comercio: comercio._id
    }).populate("comercio");

    if (!oferta) {
      return res.status(404).json({ message: "No se encontró oferta para este comercio" });
    }

    res.json(oferta);
  } catch (e) {
    console.error("Error buscando oferta por comercio:", e);
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const nuevaOferta = await Oferta.create(req.body);
    res.status(201).json(nuevaOferta);
  } catch (e) {
    console.error("Error al crear oferta:", e);
    res.status(400).json({ message: "Error al crear oferta", error: e });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Oferta.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Oferta no encontrada" });
    }

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Oferta.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Oferta no encontrada" });
    }

    res.json({
      ok: true,
      message: "Oferta eliminada correctamente",
      deleted,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/:id/clean", async (req, res) => {
  try {
    const result = await Oferta.updateOne(
      { _id: req.params.id },
      {
        $unset: {
          descripcion: "",
          precioOriginal: "",
          descuento: "",
        },
      }
    );

    res.json({
      ok: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (e) {
    console.error("Error limpiando campos legacy en oferta:", e);
    res.status(500).json({ message: e.message });
  }
});

router.post("/__debug/seed-stock", async (_req, res) => {
  try {
    const r = await Oferta.updateMany(
      { unidadesDisponibles: { $exists: false } },
      { $set: { unidadesDisponibles: 1 } }
    );
    res.json({
      matched: r.matchedCount ?? r.nMatched,
      modified: r.modifiedCount ?? r.nModified,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/__debug/clean-legacy-fields", async (_req, res) => {
  try {
    const r = await Oferta.updateMany(
      {},
      {
        $unset: {
          descripcion: "",
          precioOriginal: "",
          descuento: "",
        },
      }
    );

    res.json({
      ok: true,
      matched: r.matchedCount ?? r.nMatched,
      modified: r.modifiedCount ?? r.nModified,
    });
  } catch (e) {
    console.error("Error limpiando campos legacy (global):", e);
    res.status(500).json({ message: e.message });
  }
});

export default router;
