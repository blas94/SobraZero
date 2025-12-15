// Script para verificar y corregir la relación ofertas-comercios
import mongoose from "mongoose";
import Oferta from "../server/models/oferta.js";
import Comercio from "../server/models/comercio.js";
import dotenv from "dotenv";

dotenv.config({ path: "./back/.env" });

async function verificarYCorregir() {
    try {
        await mongoose.connect(process.env.URI_DB);
        console.log("✅ Conectado a MongoDB");

        // Obtener todas las ofertas
        const ofertas = await Oferta.find().populate("comercio");
        console.log(`\n📋 Total de ofertas: ${ofertas.length}\n`);

        for (const oferta of ofertas) {
            console.log(`Oferta: ${oferta.titulo}`);
            console.log(`  - _id: ${oferta._id}`);
            console.log(`  - comercio: ${oferta.comercio}`);

            if (oferta.comercio) {
                const comercio = await Comercio.findById(oferta.comercio);
                if (comercio) {
                    console.log(`  - ✅ Comercio asociado: ${comercio.nombre} (idExterno: ${comercio.idExterno})`);
                } else {
                    console.log(`  - ❌ Comercio no encontrado`);
                }
            } else {
                console.log(`  - ⚠️ Sin comercio asociado`);
            }
            console.log("");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("👋 Desconectado de MongoDB");
    }
}

verificarYCorregir();
