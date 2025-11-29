import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import Tarjeta from "../models/tarjeta.js";

const router = express.Router();

const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) {
  console.warn("[Pagos] MP_ACCESS_TOKEN no definido en .env");
}

const mp = new MercadoPagoConfig({ accessToken });

router.post("/crear-preferencia", async (req, res) => {
  try {
    const { reservaId, usuarioId, precio_total } = req.body;

    if (!reservaId || !precio_total) {
      return res
        .status(400)
        .json({ ok: false, message: "Faltan datos: reservaId y precio_total" });
    }

    const pref = await new Preference(mp).create({
      body: {
        items: [
          {
            id: String(reservaId),
            title: "Reserva SobraZero",
            quantity: 1,
            unit_price: Number(precio_total),
            currency_id: "ARS",
          },
        ],
        payer: usuarioId ? { id: String(usuarioId) } : undefined,
        back_urls: {
          success: `${process.env.CLIENT_URL}/pagos/estado?reserva=${reservaId}&status=success`,
          failure: `${process.env.CLIENT_URL}/pagos/estado?reserva=${reservaId}&status=failure`,
          pending: `${process.env.CLIENT_URL}/pagos/estado?reserva=${reservaId}&status=pending`,
        },
        auto_return: "approved",
      },
    });

    console.log("MP crear-preferencia OK:", pref.id);
    return res.json({
      ok: true,
      preference_id: pref.id,
      init_point: pref.init_point,
    });
  } catch (e) {
    console.error("MP crear-preferencia error:", e?.status, e?.code, e?.message);
    if (e?.status === 403 && e?.code === "PA_UNAUTHORIZED_RESULT_FROM_POLICIES") {
      return res.json({
        ok: true,
        preference_id: "SIMULATED_PREF",
        init_point: `${process.env.CLIENT_URL}/pagos/estado?reserva=${req.body?.reservaId}&status=success&simulated=1`,
        simulated: true,
      });
    }
    return res
      .status(500)
      .json({ ok: false, message: e?.message || "Error MP", detail: e });
  }
});

router.get("/tarjetas", async (req, res) => {
  try {
    const { usuarioId } = req.query;

    if (!usuarioId) {
      return res
        .status(400)
        .json({ message: "usuarioId es requerido en la consulta" });
    }

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

router.post("/tarjetas", async (req, res) => {
  try {
    const { usuarioId, alias, ultimos4, marca, esPrincipal } = req.body;

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

router.delete("/tarjetas/:id", async (req, res) => {
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

router.patch("/tarjetas/:id/principal", async (req, res) => {
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
