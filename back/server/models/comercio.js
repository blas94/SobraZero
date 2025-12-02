import mongoose from "mongoose";

const { Schema, model } = mongoose;

const comercioSchema = new Schema(
  {
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: { type: String, required: true },
    rubro: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Comercio", comercioSchema);
