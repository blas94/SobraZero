import { Schema, model, Types } from "mongoose";

const reseñaSchema = new Schema(
    {
        usuarioId: { type: Types.ObjectId, ref: "Usuario", required: true },
        comercioId: { type: Types.ObjectId, ref: "Comercio", required: true },
        calificacion: { type: Number, min: 1, max: 5, required: true },
        comentario: { type: String, required: true, maxlength: 500, trim: true },
        verificadoCompra: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Índices para optimizar consultas
reseñaSchema.index({ comercioId: 1, createdAt: -1 });
// Una reseña por usuario por comercio
reseñaSchema.index({ usuarioId: 1, comercioId: 1 }, { unique: true });

const Reseña = model("Reseña", reseñaSchema);
export default Reseña;
