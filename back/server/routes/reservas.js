import { Router } from "express";
import Reserva from "../models/reserva.js";
import Comercio from "../models/comercio.js";

const router = Router();


router.post("/", async (req, res) => {
  try {
    console.log("📦 Body recibido EN /api/reservas:", req.body);

    const {
      usuarioId,
      comercioId,
      productoNombre,
      cantidad,
    } = req.body;

    if (!usuarioId || !comercioId) {
      console.log("❌ Falta usuarioId o comercioId");
      return res.status(400).json({
        message: "usuarioId y comercioId son obligatorios",
      });
    }

    const cantidadNum = Number(cantidad);
    if (!cantidadNum || cantidadNum <= 0) {
      console.log("❌ Cantidad inválida:", cantidad);
      return res.status(400).json({
        message: "La cantidad debe ser un número mayor a 0",
      });
    }

    if (!productoNombre) {
      console.log("❌ No se envió nombre de producto");
      return res.status(400).json({
        message: "Falta el nombre del producto (productoNombre)",
      });
    }

    console.log("🔍 Buscando comercio", comercioId, "y producto", productoNombre);

    const comercio = await Comercio.findById(comercioId);
    if (!comercio) {
      console.log("❌ Comercio no encontrado:", comercioId);
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    console.log("✅ Comercio encontrado. Productos:", comercio.productos.length);

    const normalizar = (txt) =>
      String(txt).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const nombreNormalizado = normalizar(productoNombre);

    const productoEncontrado = comercio.productos.find(
      (p) => p.nombre && normalizar(p.nombre) === nombreNormalizado
    );

    if (!productoEncontrado) {
      console.log("❌ Producto no encontrado dentro del comercio");
      return res.status(404).json({
        message: `El producto "${productoNombre}" no existe en este comercio`,
      });
    }

    console.log(
      `✅ Producto encontrado: ${productoEncontrado.nombre}. ` +
      `Stock actual: ${productoEncontrado.stock}`
    );

    if (productoEncontrado.stock < cantidadNum) {
      console.log(
        `❌ Stock insuficiente. Piden ${cantidadNum}, hay ${productoEncontrado.stock}`
      );
      return res.status(400).json({
        message: `Stock insuficiente. Solo quedan ${productoEncontrado.stock}`,
      });
    }

    // Actualizar stock del producto
    productoEncontrado.stock -= cantidadNum;

    // Actualizar disponibles totales del comercio
    if (typeof comercio.disponibles === "number") {
      comercio.disponibles -= cantidadNum;
      if (comercio.disponibles < 0) comercio.disponibles = 0;
    }

    console.log(
      `📊 Nuevo stock producto ${productoEncontrado.nombre}: ${productoEncontrado.stock}`
    );
    console.log(
      `📊 Nuevo stock TOTAL comercio: ${comercio.disponibles}`
    );

    comercio.markModified("productos");
    await comercio.save();
    console.log("💾 Comercio actualizado en MongoDB");

    const nuevaReserva = await Reserva.create({
      usuarioId,
      comercioId,
      productoNombre,
      cantidad: cantidadNum,
      estado: "pendiente",
    });

    console.log("✅ Reserva creada:", nuevaReserva._id.toString());

    res.status(201).json({
      ok: true,
      message: "Reserva creada con éxito",
      reserva: nuevaReserva,
      comercioActualizado: comercio,
    });
  } catch (error) {
    console.error("❌ Error al crear reserva:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
