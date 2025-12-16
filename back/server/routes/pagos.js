import express from "express";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import Reserva from "../models/reserva.js";
import mongoose from "mongoose";

const router = express.Router();

const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) console.warn("[Pagos] MP_ACCESS_TOKEN no definido en .env");

const mp = new MercadoPagoConfig({ accessToken });

const normalizarURL = (url = "") => url.replace(/\/+$/, "");

router.get("/version", (_req, res) => {
  return res.json({
    ok: true,
    version: "pagos-router-v3-sin-simulacion",
    date: "2025-12-16",
  });
});

router.post("/crear-preferencia", async (req, res) => {
  try {
    const { reservaId, precio_total } = req.body;

    if (!reservaId || precio_total == null) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos: reservaId y precio_total",
      });
    }

    const clientUrl = normalizarURL(process.env.CLIENT_URL || "");
    if (!clientUrl) {
      return res.status(500).json({
        ok: false,
        message: "CLIENT_URL no está definido en .env",
      });
    }

    const backUrl = `${clientUrl}/pagos/estado?reserva=${encodeURIComponent(
      String(reservaId)
    )}`;

    const body = {
      items: [
        {
          id: String(reservaId),
          title: "Reserva SobraZero",
          quantity: 1,
          unit_price: Number(precio_total),
          currency_id: "ARS",
        },
      ],
      external_reference: String(reservaId),
      metadata: { reservaId: String(reservaId) },
      back_urls: {
        success: backUrl,
        failure: backUrl,
        pending: backUrl,
      },
      auto_return: "approved",
    };

    const apiPublicUrl = normalizarURL(process.env.SERVER_PUBLIC_URL || "");
    if (apiPublicUrl.startsWith("https://")) {
      body.notification_url = `${apiPublicUrl}/api/pagos/webhook`;
    }

    const pref = await new Preference(mp).create({ body });

    return res.json({
      ok: true,
      preference_id: pref.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
    });
  } catch (e) {
    console.error(
      "MP crear-preferencia error:",
      e?.status,
      e?.code,
      e?.message
    );
    return res.status(500).json({
      ok: false,
      message: e?.message || "Error Mercado Pago",
    });
  }
});

function extraerPaymentId(req) {
  const q = req.query || {};
  const body = req.body || {};

  const id1 = q["data.id"];
  const id2 = q?.data?.id;
  const id3 = q?.id;
  const id4 = body?.data?.id;

  const resource = q?.resource || body?.resource;
  let id5 = null;
  if (typeof resource === "string") {
    const m = resource.match(/\/payments\/(\d+)/);
    if (m) id5 = m[1];
  }

  const id = id1 || id2 || id3 || id4 || id5;
  if (!id) return null;

  const num = String(id).match(/\d+/)?.[0];
  return num ? Number(num) : null;
}

function esEventoPago(req) {
  const q = req.query || {};
  const tipo = (q.type || q.topic || "").toString().toLowerCase();

  return tipo === "payment";
}

router.post("/webhook", async (req, res) => {
  try {
    res.sendStatus(200);

    if (!esEventoPago(req)) return;

    const paymentId = extraerPaymentId(req);
    if (!paymentId) {
      console.warn("[MP WEBHOOK] No vino paymentId. query:", req.query);
      return;
    }

    const payment = new Payment(mp);
    const info = await payment.get({ id: paymentId });

    const status = info?.status;
    const reservaRef =
      info?.external_reference ||
      info?.metadata?.reservaId ||
      info?.metadata?.reserva_id;

    console.log(
      "[MP WEBHOOK] payment:",
      paymentId,
      "status:",
      status,
      "ref:",
      reservaRef
    );

    if (!reservaRef) {
      console.warn(
        "[MP WEBHOOK] Pago sin external_reference/metadata. paymentId:",
        paymentId
      );
      return;
    }

    if (status === "approved") {
      const reservaId = String(reservaRef);

      if (!mongoose.Types.ObjectId.isValid(reservaId)) {
        console.warn(
          "[MP WEBHOOK] external_reference no es ObjectId válido:",
          reservaId
        );
        return;
      }

      const updated = await Reserva.findByIdAndUpdate(
        reservaId,
        { $set: { estado: "pagada" } },
        { new: true }
      );

      if (!updated) {
        console.warn(
          "[MP WEBHOOK] No encontré reserva para marcar pagada:",
          reservaId
        );
      } else {
        console.log(
          "[MP WEBHOOK] Reserva marcada pagada:",
          updated._id.toString()
        );
      }
    }
  } catch (e) {
    console.error("[MP WEBHOOK] error:", e);
  }
});

export default router;