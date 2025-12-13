import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255 },
    clave: { type: String, required: true },
    tel: { type: String, trim: true, maxlength: 20 },

    ubicacion: { type: String, trim: true, maxlength: 255 },
    avatar: { type: String }, // Base64 string

    ubicacionTexto: { type: String, default: "" },

    ubicacionGeo: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },

    // Recuperación de contraseña
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // Cambio de email
    emailChangeToken: { type: String, select: false },
    emailChangeExpires: { type: Date, select: false },
    newEmailPending: { type: String, trim: true, lowercase: true, select: false },
  },
  {
    timestamps: true,
    collection: "usuarios",
  }
);

UserSchema.index({ ubicacionGeo: "2dsphere" });

export default mongoose.model("Usuario", UserSchema);
