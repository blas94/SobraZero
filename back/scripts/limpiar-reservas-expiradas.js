// Script para limpiar reservas expiradas y devolver stock
import mongoose from "mongoose";
import Reserva from "../server/models/reserva.js";
import Comercio from "../server/models/comercio.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function limpiarReservasExpiradas() {
    try {
        const ahora = new Date();

        console.log(`\n🧹 [${ahora.toISOString()}] Iniciando limpieza de reservas expiradas...`);

        // Buscar reservas pendientes que expiraron y no tienen stock devuelto
        const reservasExpiradas = await Reserva.find({
            estado: "pendiente",
            expiresAt: { $lt: ahora },
            stockDevuelto: false,
        });

        if (reservasExpiradas.length === 0) {
            console.log("✅ No hay reservas expiradas para procesar");
            return { procesadas: 0, errores: 0 };
        }

        console.log(`📋 Encontradas ${reservasExpiradas.length} reservas expiradas`);

        let procesadas = 0;
        let errores = 0;

        for (const reserva of reservasExpiradas) {
            try {
                // Buscar el comercio
                const comercio = await Comercio.findById(reserva.comercioId);

                if (!comercio) {
                    console.warn(`⚠️  Comercio ${reserva.comercioId} no encontrado para reserva ${reserva._id}`);
                    errores++;
                    continue;
                }

                // Buscar el producto
                const normalizar = (txt) =>
                    String(txt).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                const nombreNormalizado = normalizar(reserva.productoNombre);
                const producto = comercio.productos.find(
                    (p) => p.nombre && normalizar(p.nombre) === nombreNormalizado
                );

                if (!producto) {
                    console.warn(`⚠️  Producto "${reserva.productoNombre}" no encontrado en comercio ${comercio.nombre}`);
                    errores++;
                    continue;
                }

                // Devolver stock
                const stockAnterior = producto.stock;
                producto.stock += reserva.cantidad;

                // Actualizar disponibles totales
                if (typeof comercio.disponibles === "number") {
                    comercio.disponibles += reserva.cantidad;
                }

                // Guardar comercio
                comercio.markModified("productos");
                await comercio.save();

                // Marcar reserva como expirada
                reserva.estado = "expirada";
                reserva.stockDevuelto = true;
                await reserva.save();

                console.log(
                    `✅ Reserva ${reserva._id} expirada. ` +
                    `Producto: ${producto.nombre}, ` +
                    `Stock: ${stockAnterior} → ${producto.stock} (+${reserva.cantidad})`
                );

                procesadas++;
            } catch (error) {
                console.error(`❌ Error procesando reserva ${reserva._id}:`, error.message);
                errores++;
            }
        }

        console.log(`\n📊 Resumen: ${procesadas} procesadas, ${errores} errores`);
        return { procesadas, errores };

    } catch (error) {
        console.error("❌ Error en limpieza de reservas:", error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    mongoose
        .connect(process.env.URI_DB, { dbName: "sobrazero" })
        .then(() => {
            console.log("✅ Conectado a MongoDB");
            return limpiarReservasExpiradas();
        })
        .then(() => {
            console.log("\n👋 Limpieza completada");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Error:", error);
            process.exit(1);
        });
}

export default limpiarReservasExpiradas;
