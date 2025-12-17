import mongoose from "mongoose";

const { Schema, model } = mongoose;

const comercioSchema = new Schema(
  {
    idExterno: { type: String, unique: true, sparse: true },
    nombre: { type: String, required: true },
    rubro: { type: String, required: true },
    direccion: { type: String, required: true },
    coordenadas: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    telefono: { type: String, required: true },

    // Datos de la oferta principal
    descripcion: { type: String },
    horarioRetiro: { type: String },
    precioOriginal: { type: Number },
    precioDescuento: { type: Number },
    disponibles: { type: Number, default: 0 },

    // Productos individuales
    productos: [{
      id: String,
      nombre: String,
      stock: Number,
      peso: Number,
      precioOriginal: Number,
      precioDescuento: Number,
    }],

    // Calificaciones
    calificacionPromedio: { type: Number, default: 0, min: 0, max: 5 },
    totalReseñas: { type: Number, default: 0, min: 0 },

    // Metadata
    imagenUrl: { type: String, default: "" },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model("Comercio", comercioSchema);
