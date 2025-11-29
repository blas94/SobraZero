import { Schema, model, Types } from "mongoose";

const reservaSchema = new Schema(
  {
    usuarioId: { type: Types.ObjectId, ref: "Usuario", required: true },
    ofertaId: { type: Types.ObjectId, ref: "Oferta", required: true },
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
