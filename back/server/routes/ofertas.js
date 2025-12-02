import { Router } from "express";
import Oferta from "../models/oferta.js";

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
