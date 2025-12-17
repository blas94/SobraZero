import { Router } from "express";
import Reseña from "../models/reseña.js";
import Reserva from "../models/reserva.js";
import Comercio from "../models/comercio.js";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_cambia_esto";

// Helper para obtener usuario autenticado
function getAuthPayload(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            return jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
        } catch {
            // Token inválido
        }
    }

    const token = req.cookies?.token;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// Helper para buscar comercio por ID o idExterno
async function buscarComercio(comercioId) {
    // Intentar buscar por ObjectId primero
    let comercio = await Comercio.findById(comercioId).catch(() => null);

    // Si no se encuentra, buscar por idExterno
    if (!comercio) {
        comercio = await Comercio.findOne({ idExterno: comercioId });
    }

    return comercio;
}

// GET /api/resenas/comercio/:comercioId - Obtener todas las reseñas de un comercio
router.get("/comercio/:comercioId", async (req, res) => {
    try {
        const { comercioId } = req.params;

        // Buscar el comercio
        const comercio = await buscarComercio(comercioId);
        if (!comercio) {
            return res.status(404).json({ error: "Comercio no encontrado" });
        }

        const reseñas = await Reseña.find({ comercioId: comercio._id })
            .populate("usuarioId", "nombre avatar")
            .sort({ createdAt: -1 })
            .lean();

        const reseñasFormateadas = reseñas.map((r) => ({
            id: r._id.toString(),
            nombreUsuario: r.usuarioId?.nombre || "Usuario",
            avatar: r.usuarioId?.avatar || null,
            calificacion: r.calificacion,
            comentario: r.comentario,
            fecha: new Date(r.createdAt).toLocaleDateString("es-AR"),
            verificadoCompra: r.verificadoCompra,
        }));

        res.json(reseñasFormateadas);
    } catch (error) {
        console.error("Error obteniendo reseñas:", error);
        res.status(500).json({ error: "Error al obtener reseñas" });
    }
});

// GET /api/resenas/comercio/:comercioId/puede-resenar - Verificar si puede reseñar
router.get("/comercio/:comercioId/puede-resenar", async (req, res) => {
    try {
        console.log("\n🔍 [DEBUG] Verificando permisos de reseña:");
        console.log("  - comercioId recibido:", req.params.comercioId);

        const payload = getAuthPayload(req);
        console.log("  - payload:", payload);

        if (!payload) {
            console.log("  - ❌ No autorizado (sin payload)");
            return res.status(401).json({ error: "No autorizado" });
        }

        const { comercioId } = req.params;
        const usuarioId = payload.uid;
        console.log("  - usuarioId:", usuarioId);

        // Buscar el comercio
        const comercio = await buscarComercio(comercioId);
        console.log("  - comercio encontrado:", comercio ? `${comercio.nombre} (_id: ${comercio._id})` : "NO");

        if (!comercio) {
            return res.status(404).json({ error: "Comercio no encontrado" });
        }

        // Verificar si ya reseñó
        const reseñaExistente = await Reseña.findOne({ usuarioId, comercioId: comercio._id });
        console.log("  - ya reseñó:", reseñaExistente ? "SÍ" : "NO");

        if (reseñaExistente) {
            return res.json({
                puedeReseñar: false,
                yaReseñó: true,
                motivo: "Ya dejaste una reseña en este comercio",
                reseñaExistente: {
                    id: reseñaExistente._id.toString(),
                    calificacion: reseñaExistente.calificacion,
                    comentario: reseñaExistente.comentario,
                }
            });
        }

        // Verificar si tiene al menos una reserva en este comercio
        const reservaCompletada = await Reserva.findOne({
            usuarioId,
            comercioId: comercio._id,
            estado: { $in: ["pendiente", "pagada", "retirada"] },
        });
        console.log("  - reserva encontrada:", reservaCompletada ? "SÍ" : "NO");

        if (!reservaCompletada) {
            return res.json({
                puedeReseñar: false,
                yaReseñó: false,
                motivo: "Necesitás realizar una reserva para poder dejar una reseña",
            });
        }

        res.json({ puedeReseñar: true, yaReseñó: false });
    } catch (error) {
        console.error("Error verificando permisos de reseña:", error);
        res.status(500).json({ error: "Error al verificar permisos" });
    }
});

// POST /api/resenas/comercio/:comercioId - Crear reseña
router.post("/comercio/:comercioId", async (req, res) => {
    try {
        const payload = getAuthPayload(req);
        if (!payload) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const { comercioId } = req.params;
        const usuarioId = payload.uid;
        const { calificacion, comentario } = req.body;

        // Buscar el comercio
        const comercio = await buscarComercio(comercioId);
        if (!comercio) {
            return res.status(404).json({ error: "Comercio no encontrado" });
        }

        // Validaciones
        if (!calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ error: "La calificación debe estar entre 1 y 5" });
        }

        if (!comentario || !comentario.trim()) {
            return res.status(400).json({ error: "El comentario es requerido" });
        }

        if (comentario.length > 500) {
            return res.status(400).json({ error: "El comentario no puede superar los 500 caracteres" });
        }

        // Verificar si ya reseñó
        const reseñaExistente = await Reseña.findOne({ usuarioId, comercioId: comercio._id });
        if (reseñaExistente) {
            return res.status(400).json({ error: "Ya dejaste una reseña en este comercio" });
        }

        // Verificar si compró en el comercio
        const reservaCompletada = await Reserva.findOne({
            usuarioId,
            comercioId: comercio._id,
            estado: { $in: ["pendiente", "pagada", "retirada"] },
        });

        if (!reservaCompletada) {
            return res.status(403).json({
                error: "Necesitás realizar una reserva para poder dejar una reseña",
            });
        }

        // Crear reseña
        const nuevaReseña = await Reseña.create({
            usuarioId,
            comercioId: comercio._id,
            calificacion,
            comentario: comentario.trim(),
            verificadoCompra: true,
        });

        // Actualizar calificación promedio del comercio
        const todasLasReseñas = await Reseña.find({ comercioId: comercio._id });
        const totalReseñas = todasLasReseñas.length;
        const sumaCalificaciones = todasLasReseñas.reduce((sum, r) => sum + r.calificacion, 0);
        const promedioCalificacion = sumaCalificaciones / totalReseñas;

        await Comercio.findByIdAndUpdate(comercio._id, {
            calificacionPromedio: promedioCalificacion,
            totalReseñas,
        });

        // Retornar la reseña creada con datos poblados
        const reseñaConUsuario = await Reseña.findById(nuevaReseña._id)
            .populate("usuarioId", "nombre avatar")
            .lean();

        res.status(201).json({
            message: "Reseña creada con éxito",
            reseña: {
                id: reseñaConUsuario._id.toString(),
                nombreUsuario: reseñaConUsuario.usuarioId?.nombre || "Usuario",
                avatar: reseñaConUsuario.usuarioId?.avatar || null,
                calificacion: reseñaConUsuario.calificacion,
                comentario: reseñaConUsuario.comentario,
                fecha: new Date(reseñaConUsuario.createdAt).toLocaleDateString("es-AR"),
                verificadoCompra: reseñaConUsuario.verificadoCompra,
            },
        });
    } catch (error) {
        console.error("Error creando reseña:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Ya dejaste una reseña en este comercio" });
        }
        res.status(500).json({ error: "Error al crear reseña" });
    }
});

// PUT /api/resenas/:reseñaId - Editar reseña existente
router.put("/:reseñaId", async (req, res) => {
    try {
        const payload = getAuthPayload(req);
        if (!payload) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const { reseñaId } = req.params;
        const usuarioId = payload.uid;
        const { calificacion, comentario } = req.body;

        // Validaciones
        if (!calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ error: "La calificación debe estar entre 1 y 5" });
        }

        if (!comentario || !comentario.trim()) {
            return res.status(400).json({ error: "El comentario es requerido" });
        }

        if (comentario.length > 500) {
            return res.status(400).json({ error: "El comentario no puede superar los 500 caracteres" });
        }

        // Buscar la reseña
        const reseñaExistente = await Reseña.findById(reseñaId);
        if (!reseñaExistente) {
            return res.status(404).json({ error: "Reseña no encontrada" });
        }

        // Verificar que la reseña pertenece al usuario
        if (reseñaExistente.usuarioId.toString() !== usuarioId) {
            return res.status(403).json({ error: "No tienes permiso para editar esta reseña" });
        }

        // Actualizar reseña
        reseñaExistente.calificacion = calificacion;
        reseñaExistente.comentario = comentario.trim();
        await reseñaExistente.save();

        // Actualizar calificación promedio del comercio
        const todasLasReseñas = await Reseña.find({ comercioId: reseñaExistente.comercioId });
        const totalReseñas = todasLasReseñas.length;
        const sumaCalificaciones = todasLasReseñas.reduce((sum, r) => sum + r.calificacion, 0);
        const promedioCalificacion = sumaCalificaciones / totalReseñas;

        await Comercio.findByIdAndUpdate(reseñaExistente.comercioId, {
            calificacionPromedio: promedioCalificacion,
            totalReseñas,
        });

        // Retornar la reseña actualizada con datos poblados
        const reseñaActualizada = await Reseña.findById(reseñaId)
            .populate("usuarioId", "nombre avatar")
            .lean();

        res.json({
            message: "Reseña actualizada con éxito",
            reseña: {
                id: reseñaActualizada._id.toString(),
                nombreUsuario: reseñaActualizada.usuarioId?.nombre || "Usuario",
                avatar: reseñaActualizada.usuarioId?.avatar || null,
                calificacion: reseñaActualizada.calificacion,
                comentario: reseñaActualizada.comentario,
                fecha: new Date(reseñaActualizada.createdAt).toLocaleDateString("es-AR"),
                verificadoCompra: reseñaActualizada.verificadoCompra,
            },
        });
    } catch (error) {
        console.error("Error editando reseña:", error);
        res.status(500).json({ error: "Error al editar reseña" });
    }
});

export default router;
