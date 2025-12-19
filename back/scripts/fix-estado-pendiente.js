import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const comercioSchema = new mongoose.Schema({}, { strict: false });
const Comercio = mongoose.model('Comercio', comercioSchema);

async function actualizar() {
    try {
        await mongoose.connect(process.env.URI_DB);
        console.log('✅ Conectado');

        const result = await Comercio.updateMany(
            { estadoAprobacion: 'pendiente_revision' },
            { $set: { estadoAprobacion: 'pendiente' } }
        );

        console.log(`✅ Actualizados: ${result.modifiedCount} comercios`);

        await mongoose.connection.close();
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

actualizar();
