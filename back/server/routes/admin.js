import { Router } from "express";
import {
    middlewareAutenticacion,
    soloAdministrador,
} from "../middlewares/autenticacion.js";
import mongoose from "mongoose";
import Usuario from "../models/usuario.js";
import Comercio from "../models/comercio.js";
import Reserva from "../models/reserva.js";

const router = Router();

router.get("/__ping", (_req, res) => res.json({ ok: true, admin: true }));

router.get(
    "/usuarios",
    middlewareAutenticacion,
    soloAdministrador,
    async (_req, res) => {
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
            const { rol } = req.body || {};
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

router.delete(
    "/usuarios/:id",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (req.usuario?.uid === id) {
                return res
                    .status(400)
                    .json({ error: "No podés eliminar tu propio usuario admin" });
            }

            const deleted = await Usuario.findByIdAndDelete(id);
            if (!deleted)
                return res.status(404).json({ error: "Usuario no encontrado" });

            return res.json({
                ok: true,
                deleted: { _id: deleted._id, email: deleted.email },
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "No se pudo eliminar el usuario" });
        }
    }
);

router.get(
    "/usuarios/:id/reservas",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const { id } = req.params;

            const reservas = await Reserva.find({ usuarioId: id }).sort({
                createdAt: -1,
            });

            return res.json({ reservas });
        } catch (e) {
            console.error(e);
            return res
                .status(500)
                .json({ error: "No se pudieron obtener las reservas" });
        }
    }
);

router.get(
    "/reservas",
    middlewareAutenticacion,
    soloAdministrador,
    async (_req, res) => {
        try {
            const reservas = await Reserva.find().sort({ createdAt: -1 });
            res.json({ reservas });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "No se pudieron obtener las reservas" });
        }
    }
);

router.put(
    "/reservas/:id/estado",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const { estado } = req.body;

            if (!["pendiente", "pagada"].includes(estado)) {
                return res.status(400).json({ error: "Estado inválido" });
            }

            const reserva = await Reserva.findByIdAndUpdate(
                req.params.id,
                { estado },
                { new: true }
            );

            if (!reserva) {
                return res.status(404).json({ error: "Reserva no encontrada" });
            }

            res.json({ reserva });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "No se pudo actualizar el estado" });
        }
    }
);

router.get(
    "/comercios",
    middlewareAutenticacion,
    soloAdministrador,
    async (_req, res) => {
        try {
            const comercios = await Comercio.find().sort({ createdAt: -1 }).lean();

            const ids = comercios.map((c) => c._id);

            const counts = await Reserva.aggregate([
                { $match: { comercioId: { $in: ids } } },
                { $group: { _id: "$comercioId", total: { $sum: 1 } } },
            ]);

            const mapa = new Map(counts.map((x) => [String(x._id), x.total]));

            const comerciosConCount = comercios.map((c) => ({
                ...c,
                pedidosCount: mapa.get(String(c._id)) || 0,
            }));

            res.json({ comercios: comerciosConCount });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "No se pudieron obtener los comercios" });
        }
    }
);

router.get(
    "/comercios/:id",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const comercio = await Comercio.findById(req.params.id);
            if (!comercio)
                return res.status(404).json({ error: "Comercio no encontrado" });
            res.json({ comercio });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "No se pudo obtener el comercio" });
        }
    }
);

router.get(
    "/comercios/:id/reservas",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const { id } = req.params;

            const reservas = await Reserva.find({ comercioId: id })
                .sort({ createdAt: -1 })
                .populate("usuarioId", "nombre email tel");

            res.json({ reservas });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                error: "No se pudieron obtener las reservas del comercio",
            });
        }
    }
);

// Aprobar comercio
router.put(
    "/comercios/:id/aprobar",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const { id } = req.params;
            const adminId = req.usuario?.uid;

            const comercio = await Comercio.findById(id);
            if (!comercio) {
                return res.status(404).json({ error: "Comercio no encontrado" });
            }

            // Actualizar estado
            comercio.estadoAprobacion = "aprobado";
            await comercio.save();

            // Log de auditoría
            console.log(`✅ [ADMIN] Comercio aprobado: ${comercio.nombre} (ID: ${id}) por admin ${adminId}`);

            res.json({
                ok: true,
                comercio,
                message: "Comercio aprobado exitosamente"
            });
        } catch (e) {
            console.error("[ADMIN] Error aprobando comercio:", e);
            res.status(500).json({ error: "No se pudo aprobar el comercio" });
        }
    }
);

// Rechazar comercio
router.put(
    "/comercios/:id/rechazar",
    middlewareAutenticacion,
    soloAdministrador,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { razon } = req.body || {};
            const adminId = req.usuario?.uid;

            const comercio = await Comercio.findById(id);
            if (!comercio) {
                return res.status(404).json({ error: "Comercio no encontrado" });
            }

            // Actualizar estado
            comercio.estadoAprobacion = "rechazado";
            if (razon) {
                comercio.razonRechazo = razon;
            }
            await comercio.save();

            // Log de auditoría
            console.log(`❌ [ADMIN] Comercio rechazado: ${comercio.nombre} (ID: ${id}) por admin ${adminId}${razon ? ` - Razón: ${razon}` : ''}`);

            res.json({
                ok: true,
                comercio,
                message: "Comercio rechazado"
            });
        } catch (e) {
            console.error("[ADMIN] Error rechazando comercio:", e);
            res.status(500).json({ error: "No se pudo rechazar el comercio" });
        }
    }
);

export default router;
