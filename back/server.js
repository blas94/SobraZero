import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import reservasRouter from "./server/routes/reservas.js";
import authRouter from "./server/routes/auth.js";
import pagosRouter from "./server/routes/pagos.js";
import comerciosRouter from "./server/routes/comercios.js";
import reseñasRouter from "./server/routes/reseñas.js";
import mercadopagoRouter from "./server/routes/mercadopago.js";
import adminRouter from "./server/routes/admin.js";

import limpiarReservasExpiradas from "./scripts/limpiar-reservas-expiradas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

const {
  URI_DB,
  PORT = 3000,
  CLIENT_URL = "http://localhost:8080",
  NODE_ENV,
  MP_ACCESS_TOKEN,
} = process.env;

const normalizarURL = (url = "") => String(url || "").replace(/\/+$/, "");

let origenesPermitidos = [CLIENT_URL];

if (NODE_ENV !== "production") {
  origenesPermitidos.push("http://localhost:8080");
  origenesPermitidos.push("http://localhost:5173");
}

origenesPermitidos = origenesPermitidos.filter(Boolean).map(normalizarURL);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    const originNormalizado = normalizarURL(origin);

    const permitido =
      origenesPermitidos.includes(originNormalizado) ||
      originNormalizado.endsWith(".vercel.app");

    if (permitido) return cb(null, true);

    console.error("CORS Bloqueado:", originNormalizado);
    return cb(new Error("CORS bloqueado para origen: " + originNormalizado));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],

  exposedHeaders: ["Content-Length", "ETag"],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      ok: false,
      message: "La imagen es demasiado pesada (Límite del servidor excedido)",
    });
  }

  if (err?.message?.includes("CORS bloqueado")) {
    return res.status(403).json({ ok: false, message: err.message });
  }

  if (err) {
    console.error("Error no controlado:", err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }

  next();
});

mongoose
  .connect(URI_DB, { dbName: "sobrazero" })
  .then(() => console.log("Conectado a mongo"))
  .catch((e) => console.error("Error conectando a mongo:", e.message));

app.get("/api/ping", (_req, res) => res.json({ ok: true }));

app.get("/", (_req, res) => {
  res.send(`
    <h1>API SobraZero</h1>
    <p>Web Service</p>

    <h2>Endpoints disponibles</h2>
    <ul>
      <li>/api/ping</li>
      <li>/api/auth</li>
      <li>/api/reservas</li>
      <li>/api/pagos</li>
      <li>/api/comercios</li>
      <li>/api/resenas</li>
      <li>/api/mercadopago</li>
      <li>/api/admin</li>
    </ul>
  `);
});

app.use("/api/auth", authRouter);
app.use("/api/reservas", reservasRouter);
app.use("/api/pagos", pagosRouter);
app.use("/api/comercios", comerciosRouter);
app.use("/api/resenas", reseñasRouter);
app.use("/api/mercadopago", mercadopagoRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  const mpMasked = MP_ACCESS_TOKEN
    ? `${MP_ACCESS_TOKEN.slice(0, 10)}***`
    : "(no definido)";

  console.log(`Servidor andando en puerto ${PORT}`);
  console.log(`CLIENT_URL permitido: ${CLIENT_URL}`);
  console.log(`MP_ACCESS_TOKEN: ${mpMasked}`);
});

const INTERVALO_LIMPIEZA = 5 * 60 * 1000;

setInterval(async () => {
  try {
    await limpiarReservasExpiradas();
  } catch (error) {
    console.error("Error en limpieza automática:", error.message);
  }
}, INTERVALO_LIMPIEZA);

console.log("Limpieza automática de reservas configurada (cada 5 minutos)");