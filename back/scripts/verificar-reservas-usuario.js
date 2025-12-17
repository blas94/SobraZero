// Script para verificar reservas del usuario
import mongoose from "mongoose";
import Reserva from "../server/models/reserva.js";
import Comercio from "../server/models/comercio.js";
import dotenv from "dotenv";

dotenv.config({ path: "./back/.env" });

const USUARIO_ID = "68c637445ceb927c5a2fc14c"; // ID del usuario de prueba
const COMERCIO_ID = "694321cea682763f78c95e61"; // ID del comercio a verificar

async function verificarReservas() {
    try {
        await mongoose.connect(process.env.URI_DB);
        console.log("✅ Conectado a MongoDB");

        // Buscar el comercio
        const comercio = await Comercio.findById(COMERCIO_ID);
        if (!comercio) {
            console.log("❌ Comercio no encontrado");
            return;
        }

        console.log(`\n📋 Comercio: ${comercio.nombre}`);

        // Buscar reservas del usuario en este comercio
        const reservas = await Reserva.find({
            usuarioId: USUARIO_ID,
            comercioId: COMERCIO_ID
        });

        console.log(`\n🎫 Reservas del usuario en este comercio: ${reservas.length}\n`);

        reservas.forEach(r => {
            console.log(`Reserva ${r._id}:`);
            console.log(`  - comercioId: ${r.comercioId}`);
            console.log(`  - productoNombre: ${r.productoNombre}`);
            console.log(`  - cantidad: ${r.cantidad}`);
            console.log(`  - estado: ${r.estado}`);
            console.log(`  - createdAt: ${r.createdAt}`);
            console.log("");
        });

        // Verificar si hay alguna reserva con estados válidos
        const reservasValidas = await Reserva.find({
            usuarioId: USUARIO_ID,
            comercioId: COMERCIO_ID,
            estado: { $in: ["pendiente", "pagada", "retirada"] }
        });

        console.log(`✅ Reservas válidas (pendiente/pagada/retirada): ${reservasValidas.length}`);

        if (reservasValidas.length > 0) {
            console.log("\n🎉 El usuario SÍ debería poder dejar reseña!");
        } else {
            console.log("\n❌ El usuario NO puede dejar reseña (sin reservas válidas)");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n👋 Desconectado de MongoDB");
    }
}

verificarReservas();
