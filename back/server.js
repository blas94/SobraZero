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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

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
}

origenesPermitidos = origenesPermitidos.filter(Boolean).map(normalizarURL);

app.use(
  cors({
    origin: (origin, cb) => {
      const originNormalizado = normalizarURL(origin);
      if (
        !origin ||
        origenesPermitidos.includes(originNormalizado) ||
        (origin && origin.endsWith(".vercel.app"))
      ) {
        return cb(null, true);
      }
      console.error("CORS Bloqueado:", origin);
      return cb(new Error("CORS bloqueado para origen: " + origin));
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      message: "La imagen es demasiado pesada (Límite del servidor excedido)",
    });
  }
  next(err);
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
    </ul>
  `);
});

app.use("/api/auth", authRouter);
app.use("/api/reservas", reservasRouter);
app.use("/api/pagos", pagosRouter);
app.use("/api/comercios", comerciosRouter);
app.use("/api/resenas", reseñasRouter);
app.use("/api/mercadopago", mercadopagoRouter);

app.listen(PORT, () => {
  const mpMasked = MP_ACCESS_TOKEN
    ? `${MP_ACCESS_TOKEN.slice(0, 10)}***`
    : "(no definido)";
  console.log(`Servidor andando en http://localhost:${PORT}`);
  console.log(`CLIENT_URL permitido: ${CLIENT_URL}`);
  console.log(`MP_ACCESS_TOKEN: ${mpMasked}`);
});