// Script para sincronizar comercios mock con MongoDB
// Ejecutar con: node back/scripts/sincronizar-comercios.js

import mongoose from "mongoose";
import Comercio from "../server/models/comercio.js";
import dotenv from "dotenv";

dotenv.config({ path: "./back/.env" });

const comerciosMock = [
    {
        idExterno: "1",
        nombre: "Panadería Don Juan",
        direccion: "Av. Mosconi 1234",
        telefono: "+11-5555-6666",
        rubro: "panaderia"
    },
    {
        idExterno: "2",
        nombre: "Verdulería Los Andes",
        direccion: "Av. Mosconi 5678",
        telefono: "+11-4444-3333",
        rubro: "verduleria"
    },
    {
        idExterno: "3",
        nombre: "Carnicería El Bife",
        direccion: "Av. Mosconi 9012",
        telefono: "+11-2222-1111",
        rubro: "carniceria"
    }
];

async function sincronizar() {
    try {
        await mongoose.connect(process.env.URI_DB);
        console.log("✅ Conectado a MongoDB");

        for (const comercioData of comerciosMock) {
            // Buscar si ya existe
            let comercio = await Comercio.findOne({ idExterno: comercioData.idExterno });

            if (comercio) {
                // Actualizar si existe
                comercio = await Comercio.findOneAndUpdate(
                    { idExterno: comercioData.idExterno },
                    comercioData,
                    { new: true }
                );
                console.log(`📝 Actualizado: ${comercio.nombre} (ID: ${comercio._id})`);
            } else {
                // Crear si no existe
                comercio = await Comercio.create(comercioData);
                console.log(`✨ Creado: ${comercio.nombre} (ID: ${comercio._id})`);
            }
        }

        console.log("\n✅ Sincronización completada");

        // Listar todos los comercios
        const todos = await Comercio.find();
        console.log("\n📋 Comercios en la base de datos:");
        todos.forEach(c => {
            console.log(`  - ${c.nombre} (idExterno: ${c.idExterno}, _id: ${c._id})`);
        });

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n👋 Desconectado de MongoDB");
    }
}

sincronizar();
