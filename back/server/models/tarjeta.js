import mongoose from "mongoose";

const tarjetaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    alias: {
      type: String,
      required: true,
    },
    marca: {
      type: String,
      default: "Tarjeta",
    },
    ultimos4: {
      type: String,
      required: true,
    },
    esPrincipal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Tarjeta = mongoose.model("Tarjeta", tarjetaSchema);
export default Tarjeta;
