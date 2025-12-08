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
import ofertasRouter from "./server/routes/ofertas.js";
import comerciosRouter from "./server/routes/comercios.js";
import tarjetasRoutes from "./server/routes/tarjetas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

const {
  URI_DB,
  PORT = 3000,
  CLIENT_URL = "http://localhost:8080",
  MP_ACCESS_TOKEN,
  NODE_ENV,
} = process.env;

const normalizarURL = (url = "") => url.replace(/\/+$/, "");

let origenesPermitidos = [CLIENT_URL];

if (NODE_ENV !== "production") {
  origenesPermitidos.push("http://localhost:8080");
}
origenesPermitidos = origenesPermitidos.filter(Boolean).map(normalizarURL);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origenesPermitidos.includes(normalizarURL(origin)))
        return cb(null, true);
      return cb(new Error("CORS bloqueado para origen: " + origin));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

mongoose
  .connect(URI_DB, { dbName: "sobrazero" })
  .then(() => console.log("Conectado a mongo"))
  .catch((e) => console.error("Error conectando a mongo:", e.message));

app.get("/api/ping", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/reservas", reservasRouter);
app.use("/api/pagos", pagosRouter);
app.use("/api/ofertas", ofertasRouter);
app.use("/api/comercios", comerciosRouter);
app.use("/api/tarjetas", tarjetasRoutes);

app.listen(PORT, () => {
  const mpMasked = MP_ACCESS_TOKEN ? `${MP_ACCESS_TOKEN.slice(0, 10)}***` : "(no definido)";
  console.log(`Servidor andando en http://localhost:${PORT}`);
  console.log(`CLIENT_URL permitido: ${CLIENT_URL}`);
  console.log(`MP_ACCESS_TOKEN: ${mpMasked}`);
});
