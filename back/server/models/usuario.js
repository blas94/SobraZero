import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    clave: { type: String, required: true },
    tel: { type: String, trim: true, maxlength: 20 },
    rol: { type: String, enum: ["user", "admin"], default: "user" },

    avatar: { type: String },

    vioTutorial: { type: Boolean, default: false },
    tutorialPasos: { type: [String], default: [] },

    // Estadísticas del usuario
    dineroAhorrado: { type: Number, default: 0, min: 0 },
    productosSalvados: { type: Number, default: 0, min: 0 },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    emailChangeToken: { type: String, select: false },
    emailChangeExpires: { type: Date, select: false },
    newEmailPending: {
      type: String,
      trim: true,
      lowercase: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "usuarios",
  }
);

export default mongoose.model("Usuario", UserSchema);