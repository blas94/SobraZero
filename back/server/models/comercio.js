import mongoose from "mongoose";

const { Schema, model } = mongoose;

const comercioSchema = new Schema(
  {
    idExterno: { type: String, unique: true, sparse: true }, // ID para referenciar desde el frontend (sparse permite nulls)
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: { type: String, required: true },
    rubro: { type: String, required: true },
    calificacionPromedio: { type: Number, default: 0, min: 0, max: 5 },
    totalReseñas: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default model("Comercio", comercioSchema);
