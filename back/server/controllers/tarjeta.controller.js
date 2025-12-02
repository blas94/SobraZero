import Tarjeta from "../models/tarjeta.js";

export const obtenerTarjetas = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const tarjetas = await Tarjeta.find({ usuarioId }).sort({ principal: -1 });
    res.json(tarjetas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tarjetas" });
  }
};

export const agregarTarjeta = async (req, res) => {
  try {
    const { usuarioId, nombre, numero, vencimiento } = req.body;

    const numeroEnmascarado = "**** **** **** " + numero.slice(-4);

    const nueva = await Tarjeta.create({
      usuarioId,
      nombre,
      numero: numeroEnmascarado,
      vencimiento,
    });

    res.json(nueva);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar tarjeta" });
  }
};

export const eliminarTarjeta = async (req, res) => {
  try {
    await Tarjeta.findByIdAndDelete(req.params.id);
    res.json({ message: "Tarjeta eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tarjeta" });
  }
};

export const establecerPrincipal = async (req, res) => {
  try {
    const tarjetaId = req.params.id;
    const { usuarioId } = req.body;

    await Tarjeta.updateMany({ usuarioId }, { principal: false });

    await Tarjeta.findByIdAndUpdate(tarjetaId, { principal: true });

    res.json({ message: "Tarjeta principal actualizada" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar tarjeta principal" });
  }
};
