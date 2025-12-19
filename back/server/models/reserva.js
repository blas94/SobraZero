import { Schema, model, Types } from "mongoose";

const reservaSchema = new Schema(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    comercioId: { type: Schema.Types.ObjectId, ref: "Comercio", required: true },
    productoNombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    precioOriginal: { type: Number, required: true },
    precioDescuento: { type: Number, required: true },
    estado: {
      type: String,
      enum: ["pendiente", "pagada", "retirada", "cancelada", "expirada"],
      default: "pendiente",
    },
    expiresAt: { type: Date, required: true }, // Cuándo expira la reserva
    stockDevuelto: { type: Boolean, default: false }, // Si ya se devolvió el stock
  },
  { timestamps: true }
);

// Índice para búsqueda eficiente de reservas expiradas
reservaSchema.index({ estado: 1, expiresAt: 1, stockDevuelto: 1 });

const Reserva = model("Reserva", reservaSchema);
export default Reserva;
