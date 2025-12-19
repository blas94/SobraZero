import { Router } from "express";
import Reserva from "../models/reserva.js";
import Comercio from "../models/comercio.js";
import Usuario from "../models/usuario.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { usuarioId, comercioId, productoNombre, cantidad } = req.body;

    if (!usuarioId || !comercioId || !productoNombre || !cantidad) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const cantidadNum = Number(cantidad);
    if (cantidadNum <= 0) {
      return res.status(400).json({ message: "Cantidad invÃ¡lida" });
    }

    const comercio = await Comercio.findById(comercioId);
    if (!comercio) {
      return res.status(404).json({ message: "Comercio no encontrado" });
    }

    const normalizar = (txt) =>
      String(txt).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const producto = comercio.productos.find(
      (p) => normalizar(p.nombre) === normalizar(productoNombre)
    );

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (producto.stock < cantidadNum) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    producto.stock -= cantidadNum;
    comercio.disponibles = Math.max(
      0,
      (comercio.disponibles || 0) - cantidadNum
    );

    comercio.markModified("productos");
    await comercio.save();

    // Calcular ahorro: (precioOriginal - precioDescuento) × cantidad
    const precioOrig = producto.precioOriginal || 0;
    const precioDesc = producto.precioDescuento || 0;
    const ahorro = (precioOrig - precioDesc) * cantidadNum;

    const reserva = await Reserva.create({
      usuarioId,
      comercioId,
      productoNombre,
      cantidad: cantidadNum,
      precioOriginal: precioOrig,
      precioDescuento: precioDesc,
      estado: "pendiente",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      stockDevuelto: false,
    });

    // Actualizar estadísticas del usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
      $inc: {
        dineroAhorrado: ahorro,
        productosSalvados: 1, // Cada reserva = 1 producto salvado
      },
    });

    res.status(201).json({ ok: true, reserva });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error interno" });
  }
});

router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const reservas = await Reserva.find({ usuarioId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ ok: true, reservas });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error cargando pedidos" });
  }
});

export default router;