/**
 * Script para configurar estadoAprobacion en comercios
 * Establece "pendiente" para comercios sin estado
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const comercioSchema = new mongoose.Schema({
    nombre: String,
    estadoAprobacion: String
}, { strict: false });

const Comercio = mongoose.model('Comercio', comercioSchema);

async function configurarEstados() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(process.env.URI_DB);
        console.log('✅ Conectado a MongoDB\n');

        // Buscar comercios sin estadoAprobacion o con valor undefined/null
        const comerciosSinEstado = await Comercio.find({
            $or: [
                { estadoAprobacion: { $exists: false } },
                { estadoAprobacion: null },
                { estadoAprobacion: '' }
            ]
        });

        console.log(`📊 Comercios sin estado encontrados: ${comerciosSinEstado.length}\n`);

        if (comerciosSinEstado.length === 0) {
            console.log('✅ Todos los comercios ya tienen estado configurado');

            // Mostrar resumen de estados actuales
            const resumen = await Comercio.aggregate([
                { $group: { _id: '$estadoAprobacion', total: { $sum: 1 } } }
            ]);

            console.log('\n📊 Resumen de estados:');
            resumen.forEach(r => {
                console.log(`   ${r._id || 'sin estado'}: ${r.total}`);
            });

            return;
        }

        // Mostrar lista
        console.log('📝 Comercios que serán configurados como "pendiente":');
        comerciosSinEstado.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.nombre} (ID: ${c._id})`);
        });
        console.log('');

        // Actualizar todos a "pendiente"
        let actualizados = 0;
        for (const comercio of comerciosSinEstado) {
            try {
                await Comercio.updateOne(
                    { _id: comercio._id },
                    { $set: { estadoAprobacion: 'pendiente' } }
                );
                console.log(`✅ ${comercio.nombre} → pendiente`);
                actualizados++;
            } catch (error) {
                console.error(`❌ Error en ${comercio.nombre}:`, error.message);
            }
        }

        console.log(`\n🎉 Proceso completado: ${actualizados}/${comerciosSinEstado.length} comercios actualizados`);

        // Mostrar resumen final
        const resumenFinal = await Comercio.aggregate([
            { $group: { _id: '$estadoAprobacion', total: { $sum: 1 } } }
        ]);

        console.log('\n📊 Resumen final de estados:');
        resumenFinal.forEach(r => {
            console.log(`   ${r._id || 'sin estado'}: ${r.total}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

configurarEstados();
