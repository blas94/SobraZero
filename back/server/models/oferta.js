import mongoose from "mongoose";
import "./comercio.js";

const { Schema, model } = mongoose;

const productoSchema = new Schema(
  {
    nombre: { type: String, required: true },
    precioOriginal: { type: Number, required: true },
    precioOferta: { type: Number, required: true },
    unidadesDisponibles: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const ofertaSchema = new Schema(
  {
    titulo: { type: String, required: true },

    comercio: {
      type: Schema.Types.ObjectId,
      ref: "Comercio",
      required: true,
    },

    productos: {
      type: [productoSchema],
      default: [],
    },

    unidadesDisponibles: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("Oferta", ofertaSchema);
