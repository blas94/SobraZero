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
    alias: { type: String }, // Alias de Mercado Pago para recibir pagos

    // Horarios de disponibilidad semanal
    horarios: [{
      dia: {
        type: String,
        enum: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"],
        required: true
      },
      abierto: { type: Boolean, default: true },
      horaApertura: { type: String }, // Formato: "HH:MM"
      horaCierre: { type: String }, // Formato: "HH:MM"
    }],

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
      imageUrl: String, // URL de la imagen del producto
    }],

    // Calificaciones
    calificacionPromedio: { type: Number, default: 0, min: 0, max: 5 },
    totalReseñas: { type: Number, default: 0, min: 0 },

    // Metadata
    imagenUrl: { type: String, default: "" },
    activo: { type: Boolean, default: true },

    // Sistema de aprobación
    estadoAprobacion: {
      type: String,
      enum: ["pendiente_revision", "aprobado", "rechazado"],
      default: "pendiente_revision",
    },
    propietarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: false, // Opcional para mantener compatibilidad con comercios existentes
    },
    razonRechazo: { type: String }, // Solo si es rechazado
  },
  { timestamps: true }
);

export default model("Comercio", comercioSchema);
