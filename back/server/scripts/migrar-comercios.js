import mongoose from "mongoose";
import Comercio from "../models/comercio.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio back
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI no está definido en .env");
    process.exit(1);
}

async function migrarComercios() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Conectado a MongoDB");

        // Buscar comercios sin estadoAprobacion
        const comerciosSinEstado = await Comercio.find({
            estadoAprobacion: { $exists: false },
        });

        console.log(`📦 Encontrados ${comerciosSinEstado.length} comercios para migrar`);

        if (comerciosSinEstado.length === 0) {
            console.log("✅ No hay comercios para migrar");
            process.exit(0);
        }

        // Actualizar cada comercio
        for (const comercio of comerciosSinEstado) {
            await Comercio.updateOne(
                { _id: comercio._id },
                {
                    $set: {
                        estadoAprobacion: "aprobado", // Aprobar automáticamente los existentes
                        activo: true, // Activar automáticamente los existentes
                        // propietarioId se deja sin definir para comercios legacy
                    },
                }
            );
            console.log(`✅ Migrado: ${comercio.nombre}`);
        }

        console.log(`\n🎉 Migración completada: ${comerciosSinEstado.length} comercios actualizados`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error en migración:", error);
        process.exit(1);
    }
}

migrarComercios();
