// Script para verificar reservas del usuario
import mongoose from "mongoose";
import Reserva from "../server/models/reserva.js";
import Oferta from "../server/models/oferta.js";
import dotenv from "dotenv";

dotenv.config({ path: "./back/.env" });

const USUARIO_ID = "68c637445ceb927c5a2fc14c"; // ID del usuario de prueba
const COMERCIO_ID_EXTERNO_3 = "68c63b3f5ceb927c5a2fc14e"; // Carnicería El Bife (idExterno: 3)

async function verificarReservas() {
    try {
        await mongoose.connect(process.env.URI_DB);
        console.log("✅ Conectado a MongoDB");

        // Buscar ofertas del comercio 3 (Carnicería El Bife)
        const ofertas = await Oferta.find({ comercio: COMERCIO_ID_EXTERNO_3 });
        console.log(`\n📋 Ofertas del comercio 3 (Carnicería El Bife): ${ofertas.length}`);

        const ofertaIds = ofertas.map(o => o._id);
        console.log(`Oferta IDs:`, ofertaIds.map(id => id.toString()));

        // Buscar reservas del usuario en esas ofertas
        const reservas = await Reserva.find({
            usuarioId: USUARIO_ID,
            ofertaId: { $in: ofertaIds }
        });

        console.log(`\n🎫 Reservas del usuario en comercio 3: ${reservas.length}\n`);

        reservas.forEach(r => {
            console.log(`Reserva ${r._id}:`);
            console.log(`  - ofertaId: ${r.ofertaId}`);
            console.log(`  - cantidad: ${r.cantidad}`);
            console.log(`  - estado: ${r.estado}`);
            console.log(`  - createdAt: ${r.createdAt}`);
            console.log("");
        });

        // Verificar si hay alguna reserva con estados válidos
        const reservasValidas = await Reserva.find({
            usuarioId: USUARIO_ID,
            ofertaId: { $in: ofertaIds },
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
