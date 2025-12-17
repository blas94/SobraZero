import { Schema, model, Types } from "mongoose";

const reservaSchema = new Schema(
  {
    usuarioId: { type: Types.ObjectId, ref: "Usuario", required: true },
    comercioId: { type: Types.ObjectId, ref: "Comercio", required: true },
    productoNombre: { type: String, required: true },
    cantidad: { type: Number, min: 1, required: true },
    estado: {
      type: String,
      enum: ["pendiente", "pagada", "cancelada", "retirada"],
      default: "pendiente"
    }
  },
  { timestamps: true }
);

const Reserva = model("Reserva", reservaSchema);
export default Reserva;
