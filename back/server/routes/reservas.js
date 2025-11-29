import { Router } from "express";
import Reserva from "../models/reserva.js";
import Oferta from "../models/oferta.js";

const router = Router();


router.post("/", async (req, res) => {
  try {
    console.log(" Body recibido EN /api/reservas:", req.body);

    const {
      usuarioId,
      ofertaId,
      productoNombre,
      producto,
      cantidad,
    } = req.body;

    if (!usuarioId || !ofertaId) {
      console.log("Falta usuarioId u ofertaId");
      return res.status(400).json({
        message: "usuarioId y ofertaId son obligatorios",
      });
    }

    const cantidadNum = Number(cantidad);
    if (!cantidadNum || cantidadNum <= 0) {
      console.log("Cantidad inválida:", cantidad);
      return res.status(400).json({
        message: "La cantidad debe ser un número mayor a 0",
      });
    }

    const nombreBuscado =
      productoNombre ||
      producto?.nombre ||
      producto?.titulo ||
      producto?.name;

    if (!nombreBuscado) {
      console.log("No se envió nombre de producto");
      return res.status(400).json({
        message:
          "Falta el nombre del producto. Enviar productoNombre o producto.nombre",
      });
    }

    console.log(" Buscando oferta", ofertaId, "y producto", nombreBuscado);

    const oferta = await Oferta.findById(ofertaId);
    if (!oferta) {
      console.log("Oferta no encontrada:", ofertaId);
      return res.status(404).json({ message: "Oferta no encontrada" });
    }

    console.log("Oferta encontrada. Productos:", oferta.productos.length);

    const normalizar = (txt) =>
      String(txt).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const nombreNormalizado = normalizar(nombreBuscado);

    const productoEncontrado = oferta.productos.find(
      (p) => p.nombre && normalizar(p.nombre) === nombreNormalizado
    );

    if (!productoEncontrado) {
      console.log("Producto no encontrado dentro de la oferta");
      return res.status(404).json({
        message: `El producto "${nombreBuscado}" no existe en esta oferta`,
      });
    }

    console.log(
      ` Producto encontrado: ${productoEncontrado.nombre}. ` +
        `Stock actual: ${productoEncontrado.unidadesDisponibles}`
    );

    if (productoEncontrado.unidadesDisponibles < cantidadNum) {
      console.log(
        `Stock insuficiente. Piden ${cantidadNum}, hay ${productoEncontrado.unidadesDisponibles}`
      );
      return res.status(400).json({
        message: `Stock insuficiente. Solo quedan ${productoEncontrado.unidadesDisponibles}`,
      });
    }

    productoEncontrado.unidadesDisponibles -= cantidadNum;

    if (typeof oferta.unidadesDisponibles === "number") {
      oferta.unidadesDisponibles -= cantidadNum;
      if (oferta.unidadesDisponibles < 0) oferta.unidadesDisponibles = 0;
    }

    console.log(
      `Nuevo stock producto ${productoEncontrado.nombre}: ${productoEncontrado.unidadesDisponibles}`
    );
    console.log(
      `Nuevo stock TOTAL oferta: ${oferta.unidadesDisponibles}`
    );

    oferta.markModified("productos");
    await oferta.save();
    console.log(" Oferta actualizada en MongoDB");

    const nuevaReserva = await Reserva.create({
      usuarioId,
      ofertaId,
      cantidad: cantidadNum,
      estado: "pendiente",
    });

    console.log("Reserva creada:", nuevaReserva._id.toString());

    res.status(201).json({
      ok: true,
      message: "Reserva creada con éxito",
      reserva: nuevaReserva,
      ofertaActualizada: oferta,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
