import { Router } from "express";
import Comercio from "../models/comercio.js";

const router = Router();

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
    const nuevo = await Comercio.create(req.body);
    res.status(201).json(nuevo);
  } catch (e) {
    console.error("Error al crear comercio:", e);
    res.status(400).json({ message: "Error al crear comercio", error: e });
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
