import express from "express";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import mongoose from "mongoose";
import Reserva from "../models/reserva.js";

const router = express.Router();

const normalizarURL = (url = "") => String(url || "").replace(/\/+$/, "");

// Config MP
const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) console.warn("[Pagos] MP_ACCESS_TOKEN no definido en .env");

const mp = new MercadoPagoConfig({ accessToken });

// Modo explícito (opcional)
// En Render podés setear:
// MP_MODE=prod   o   MP_MODE=sandbox
const MP_MODE = String(process.env.MP_MODE || "").toLowerCase().trim();

// Heurística si NO seteás MP_MODE:
const esTokenTest = () => String(process.env.MP_ACCESS_TOKEN || "").startsWith("TEST-");

// Definir sandbox/prod de forma robusta:
const esSandbox = () => {
  if (MP_MODE === "sandbox") return true;
  if (MP_MODE === "prod" || MP_MODE === "production") return false;
  // fallback:
  return esTokenTest();
};

router.get("/version", (_req, res) => {
  return res.json({
    ok: true,
    version: "pagos-router-v5-checkout_url",
    date: "2025-12-17",
    mode: esSandbox() ? "sandbox" : "prod",
    token_hint: esTokenTest() ? "TEST-" : "APP_USR-/OTHER",
    mp_mode_env: MP_MODE || "(no definido)",
  });
});

router.post("/crear-preferencia", async (req, res) => {
  try {
    const { reservaId, precio_total } = req.body || {};

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
        message: "CLIENT_URL no está definido en el entorno",
      });
    }

    const serverPublicUrl = normalizarURL(process.env.SERVER_PUBLIC_URL || "");
    if (!serverPublicUrl) {
      return res.status(500).json({
        ok: false,
        message: "SERVER_PUBLIC_URL no está definido en el entorno",
      });
    }

    const backUrl = `${clientUrl}/pagos/estado?reserva=${encodeURIComponent(String(reservaId))}`;

    const body = {
      items: [
        {
          id: String(reservaId),
          title: "SobraZero",
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
      notification_url: `${serverPublicUrl}/api/pagos/webhook`,
    };

    const pref = await new Preference(mp).create({ body });

    const sandbox = esSandbox();

    // URL final única (esto evita que el FRONT “elija mal”)
    const checkout_url =
      sandbox && pref?.sandbox_init_point ? pref.sandbox_init_point : pref?.init_point;

    if (!checkout_url) {
      return res.status(500).json({
        ok: false,
        message: "Mercado Pago no devolvió init_point",
      });
    }

    return res.json({
      ok: true,
      preference_id: pref.id,

      checkout_url,

      init_point: pref?.init_point,
      sandbox_init_point: pref?.sandbox_init_point,

      mode: sandbox ? "sandbox" : "prod",
    });
  } catch (e) {
    const status = e?.status ?? e?.response?.status;
    const code = e?.code ?? e?.response?.data?.code;
    const msg = e?.message ?? e?.response?.data?.message;

    console.error("[MP] crear-preferencia error:", status, code, msg);

    return res.status(500).json({
      ok: false,
      message: msg || "Error Mercado Pago",
      detail: { status, code },
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
  const tipo = String(q.type || q.topic || "").toLowerCase();

  if (tipo === "payment") return true;

  const resource = String(q.resource || req.body?.resource || "");
  if (resource.includes("/payments/")) return true;

  return false;
}

router.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  setImmediate(async () => {
    try {
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

      console.log("[MP WEBHOOK] status:", info?.status);
      console.log("[MP WEBHOOK] status_detail:", info?.status_detail);
      console.log("[MP WEBHOOK] payment_method_id:", info?.payment_method_id);
      console.log("[MP WEBHOOK] rejection_reason:", info?.status_detail);

      if (!reservaRef) return;

      const reservaId = String(reservaRef);

      if (!mongoose.Types.ObjectId.isValid(reservaId)) {
        console.warn("[MP WEBHOOK] reservaId inválido:", reservaId);
        return;
      }

      if (status === "approved") {
        const updated = await Reserva.findByIdAndUpdate(
          reservaId,
          {
            $set: {
              estado: "pagada",
              stockDevuelto: true // Marcar para que no se devuelva el stock
            }
          },
          { new: true }
        );

        if (updated) {
          console.log("[MP WEBHOOK] Reserva marcada pagada:", updated._id.toString());
        } else {
          console.warn("[MP WEBHOOK] No encontré reserva:", reservaId);
        }
      }
    } catch (e) {
      console.error("[MP WEBHOOK] error:", e?.message || e);
    }
  });
});

export default router;