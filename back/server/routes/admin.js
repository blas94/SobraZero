import { Router } from "express";
import {
    middlewareAutenticacion,
    soloAdministrador,
} from "../middlewares/autenticacion.js";
import Usuario from "../models/usuario.js";

const router = Router();

router.get(
    "/usuarios",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const usuarios = await Usuario.find()
                .select("_id nombre email tel rol createdAt")
                .sort({ createdAt: -1 });

            res.json({ usuarios });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "No se pudieron obtener los usuarios" });
        }
    }
);

router.put(
    "/usuarios/:id/rol",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const { rol } = req.body;
            if (!["user", "admin"].includes(rol)) {
                return res.status(400).json({ error: "Rol inválido" });
            }

            if (req.usuario?.uid === req.params.id && rol !== "admin") {
                return res
                    .status(400)
                    .json({ error: "No podés quitarte tu propio rol admin" });
            }

            const usuario = await Usuario.findByIdAndUpdate(
                req.params.id,
                { rol },
                { new: true }
            ).select("_id nombre email rol");

            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            res.json({ usuario });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "No se pudo actualizar el rol" });
        }
    }
);

export default router;
