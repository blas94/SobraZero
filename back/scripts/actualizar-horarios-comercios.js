/**
 * Script para actualizar comercios sin horarios
 * Agrega horarios por defecto a comercios que no los tienen
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env') });

// Esquema simplificado de Comercio
const comercioSchema = new mongoose.Schema({
    nombre: String,
    horarios: [{
        dia: String,
        abierto: Boolean,
        horaApertura: String,
        horaCierre: String
    }]
}, { strict: false });

const Comercio = mongoose.model('Comercio', comercioSchema);

// Horarios por defecto (Lunes a Viernes 9:00-18:00)
const horariosDefault = [
    { dia: 'lunes', abierto: true, horaApertura: '09:00', horaCierre: '18:00' },
    { dia: 'martes', abierto: true, horaApertura: '09:00', horaCierre: '18:00' },
    { dia: 'miércoles', abierto: true, horaApertura: '09:00', horaCierre: '18:00' },
    { dia: 'jueves', abierto: true, horaApertura: '09:00', horaCierre: '18:00' },
    { dia: 'viernes', abierto: true, horaApertura: '09:00', horaCierre: '18:00' },
    { dia: 'sábado', abierto: false, horaApertura: '09:00', horaCierre: '18:00' },
    { dia: 'domingo', abierto: false, horaApertura: '09:00', horaCierre: '18:00' }
];

async function actualizarComercios() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(process.env.URI_DB);
        console.log('✅ Conectado a MongoDB\n');

        // Buscar comercios sin horarios o con horarios vacíos
        const comerciosSinHorarios = await Comercio.find({
            $or: [
                { horarios: { $exists: false } },
                { horarios: { $size: 0 } },
                { horarios: null }
            ]
        });

        console.log(`📊 Comercios sin horarios encontrados: ${comerciosSinHorarios.length}\n`);

        if (comerciosSinHorarios.length === 0) {
            console.log('✅ Todos los comercios ya tienen horarios configurados');
            return;
        }

        // Mostrar lista de comercios a actualizar
        console.log('📝 Comercios que serán actualizados:');
        comerciosSinHorarios.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.nombre} (ID: ${c._id})`);
        });
        console.log('');

        // Actualizar cada comercio
        let actualizados = 0;
        for (const comercio of comerciosSinHorarios) {
            try {
                await Comercio.updateOne(
                    { _id: comercio._id },
                    { $set: { horarios: horariosDefault } }
                );
                console.log(`✅ Actualizado: ${comercio.nombre}`);
                actualizados++;
            } catch (error) {
                console.error(`❌ Error actualizando ${comercio.nombre}:`, error.message);
            }
        }

        console.log(`\n🎉 Proceso completado: ${actualizados}/${comerciosSinHorarios.length} comercios actualizados`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar script
actualizarComercios();
