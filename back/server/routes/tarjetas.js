import { Router } from "express";
import Tarjeta from "../models/tarjeta.js";

const router = Router();

router.get("/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const tarjetas = await Tarjeta.find({ usuarioId }).sort({
      esPrincipal: -1,
      createdAt: -1,
    });

    return res.json(tarjetas);
  } catch (error) {
    console.error("Error obteniendo tarjetas:", error);
    return res
      .status(500)
      .json({ message: "Error obteniendo tarjetas guardadas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { usuarioId, alias, marca, ultimos4, esPrincipal } = req.body;

    if (!usuarioId || !alias || !ultimos4) {
      return res.status(400).json({
        message: "usuarioId, alias y ultimos4 son requeridos",
      });
    }

    const ultimos4Str = String(ultimos4).replace(/\D/g, "").slice(-4);

    const cantidad = await Tarjeta.countDocuments({ usuarioId });
    let esPrincipalFinal = !!esPrincipal;
    if (cantidad === 0) {
      esPrincipalFinal = true;
    }

    const tarjeta = await Tarjeta.create({
      usuarioId,
      alias,
      marca: marca || "Tarjeta",
      ultimos4: ultimos4Str,
      esPrincipal: esPrincipalFinal,
    });

    return res.status(201).json(tarjeta);
  } catch (error) {
    console.error("Error creando tarjeta:", error);
    return res.status(500).json({ message: "Error creando tarjeta" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tarjeta = await Tarjeta.findByIdAndDelete(id);
    if (!tarjeta) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando tarjeta:", error);
    return res.status(500).json({ message: "Error eliminando tarjeta" });
  }
});

router.patch("/:id/principal", async (req, res) => {
  try {
    const { id } = req.params;

    const tarjeta = await Tarjeta.findById(id);
    if (!tarjeta) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    await Tarjeta.updateMany(
      { usuarioId: tarjeta.usuarioId },
      { $set: { esPrincipal: false } }
    );

    tarjeta.esPrincipal = true;
    await tarjeta.save();

    return res.json(tarjeta);
  } catch (error) {
    console.error("Error marcando tarjeta principal:", error);
    return res
      .status(500)
      .json({ message: "Error marcando tarjeta como principal" });
  }
});

export default router;
