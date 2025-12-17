import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Comercio from "../server/models/comercio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Datos hardcodeados de datos-comercios.js
const comerciosHardcodeados = [
    {
        id: "1",
        nombre: "Panaderia Don Juan",
        categoria: "panaderia",
        latitud: -34.6025,
        longitud: -58.3945,
        direccion: "Av. Corrientes 2850, Balvanera",
        calificacion: 4.5,
        totalReseñas: 127,
        precioOriginal: 2500,
        precioDescuento: 1000,
        horarioRetiro: "18:00 - 20:00",
        disponibles: 5,
        descripcion:
            "Bolsa sorpresa con productos de panadería frescos del día: pan, facturas, medialunas y más. Todos los productos están en perfecto estado.",
        productos: [
            {
                id: "1-1",
                nombre: "Medialunas",
                stock: 24,
                peso: 0.6,
                precioOriginal: 150,
                precioDescuento: 60,
            },
            {
                id: "1-2",
                nombre: "Pan francés",
                stock: 15,
                peso: 0.5,
                precioOriginal: 200,
                precioDescuento: 80,
            },
            {
                id: "1-3",
                nombre: "Facturas surtidas",
                stock: 20,
                precioOriginal: 120,
                precioDescuento: 48,
            },
            {
                id: "1-4",
                nombre: "Pan de campo",
                stock: 10,
                peso: 1.0,
                precioOriginal: 350,
                precioDescuento: 140,
            },
        ],
        imagenUrl: "",
    },
    {
        id: "2",
        nombre: "Supermercado Express",
        categoria: "supermercado",
        latitud: -34.6058,
        longitud: -58.3975,
        direccion: "Av. Pueyrredón 258, Balvanera",
        calificacion: 4.2,
        totalReseñas: 89,
        precioOriginal: 3000,
        precioDescuento: 1500,
        horarioRetiro: "19:00 - 21:00",
        disponibles: 8,
        descripcion:
            "Bolsa sorpresa con variedad de productos: verduras, frutas, lácteos y otros productos frescos. Perfecto para abastecer tu hogar.",
        productos: [
            {
                id: "2-1",
                nombre: "Frutas de estación variadas",
                stock: 30,
                peso: 2.0,
                precioOriginal: 800,
                precioDescuento: 400,
            },
            {
                id: "2-2",
                nombre: "Verduras frescas mixtas",
                stock: 25,
                peso: 1.5,
                precioOriginal: 600,
                precioDescuento: 300,
            },
            {
                id: "2-3",
                nombre: "Lácteos (leche, yogurt)",
                stock: 40,
                precioOriginal: 500,
                precioDescuento: 250,
            },
            {
                id: "2-4",
                nombre: "Pan del día",
                stock: 20,
                peso: 0.5,
                precioOriginal: 250,
                precioDescuento: 125,
            },
            {
                id: "2-5",
                nombre: "Productos de almacén",
                stock: 35,
                precioOriginal: 400,
                precioDescuento: 200,
            },
        ],
    },
    {
        id: "3",
        nombre: "Verdulería Los Andes",
        categoria: "verduleria",
        latitud: -34.607,
        longitud: -58.395,
        direccion: "Av. Córdoba 2645, Balvanera",
        calificacion: 4.7,
        totalReseñas: 156,
        precioOriginal: 2000,
        precioDescuento: 900,
        horarioRetiro: "17:00 - 19:00",
        disponibles: 3,
        descripcion:
            "Bolsa sorpresa con frutas y verduras frescas de estación. Productos de excelente calidad directos de la quinta.",
        productos: [
            {
                id: "3-1",
                nombre: "Tomates",
                stock: 18,
                peso: 1.0,
                precioOriginal: 400,
                precioDescuento: 180,
            },
            {
                id: "3-2",
                nombre: "Lechuga",
                stock: 25,
                precioOriginal: 300,
                precioDescuento: 135,
            },
            {
                id: "3-3",
                nombre: "Zanahorias",
                stock: 20,
                peso: 0.5,
                precioOriginal: 200,
                precioDescuento: 90,
            },
            {
                id: "3-4",
                nombre: "Manzanas",
                stock: 22,
                peso: 1.0,
                precioOriginal: 450,
                precioDescuento: 203,
            },
            {
                id: "3-5",
                nombre: "Bananas",
                stock: 30,
                peso: 0.5,
                precioOriginal: 250,
                precioDescuento: 113,
            },
            {
                id: "3-6",
                nombre: "Papas",
                stock: 15,
                peso: 1.0,
                precioOriginal: 350,
                precioDescuento: 158,
            },
        ],
    },
    {
        id: "4",
        nombre: "Restaurante La Estancia",
        categoria: "restaurante",
        latitud: -34.6032,
        longitud: -58.4005,
        direccion: "Av. Rivadavia 2380, Balvanera",
        calificacion: 4.8,
        totalReseñas: 203,
        precioOriginal: 5000,
        precioDescuento: 1500,
        horarioRetiro: "20:00 - 21:30",
        disponibles: 4,
        descripcion:
            "Bolsa sorpresa con platos preparados del día: minutas, guarniciones y postres. Comida casera de alta calidad.",
        productos: [
            {
                id: "4-1",
                nombre: "Milanesa napolitana con guarnición",
                stock: 12,
                precioOriginal: 1500,
                precioDescuento: 450,
            },
            {
                id: "4-2",
                nombre: "Ensalada mixta",
                stock: 15,
                precioOriginal: 800,
                precioDescuento: 240,
            },
            {
                id: "4-3",
                nombre: "Tarta de verduras",
                stock: 10,
                precioOriginal: 1200,
                precioDescuento: 360,
            },
            {
                id: "4-4",
                nombre: "Flan casero con dulce de leche",
                stock: 18,
                precioOriginal: 600,
                precioDescuento: 180,
            },
        ],
    },
    {
        id: "5",
        nombre: "Panadería Artesanal",
        categoria: "panaderia",
        latitud: -34.6048,
        longitud: -58.3918,
        direccion: "Av. Callao 348, Balvanera",
        calificacion: 4.6,
        totalReseñas: 94,
        precioOriginal: 2800,
        precioDescuento: 980,
        horarioRetiro: "18:30 - 20:00",
        disponibles: 6,
        descripcion:
            "Bolsa sorpresa con pan artesanal, masas dulces y productos de pastelería. Todo elaborado con masa madre y productos naturales.",
        productos: [
            {
                id: "5-1",
                nombre: "Pan de masa madre integral",
                stock: 16,
                peso: 1.0,
                precioOriginal: 500,
                precioDescuento: 175,
            },
            {
                id: "5-2",
                nombre: "Croissants de manteca",
                stock: 24,
                precioOriginal: 400,
                precioDescuento: 140,
            },
            {
                id: "5-3",
                nombre: "Budín de limón",
                stock: 12,
                peso: 0.5,
                precioOriginal: 600,
                precioDescuento: 210,
            },
            {
                id: "5-4",
                nombre: "Cookies artesanales",
                stock: 30,
                precioOriginal: 350,
                precioDescuento: 123,
            },
        ],
    },
];

const migrarComercios = async () => {
    try {
        console.log("Conectando a MongoDB...");
        await mongoose.connect(process.env.URI_DB);
        console.log("✅ Conectado a MongoDB");

        // Limpiar comercios existentes
        const deleted = await Comercio.deleteMany({});
        console.log(`🗑️  ${deleted.deletedCount} comercios existentes eliminados`);

        // Transformar datos
        const comerciosTransformados = comerciosHardcodeados.map((c) => ({
            nombre: c.nombre,
            rubro: c.categoria,
            direccion: c.direccion,
            coordenadas: {
                lat: c.latitud,
                lng: c.longitud,
            },
            telefono: "Sin teléfono",
            descripcion: c.descripcion,
            horarioRetiro: c.horarioRetiro,
            precioOriginal: c.precioOriginal,
            precioDescuento: c.precioDescuento,
            disponibles: c.disponibles,
            productos: c.productos || [],
            calificacionPromedio: c.calificacion,
            totalReseñas: c.totalReseñas,
            imagenUrl: c.imagenUrl || "",
            activo: true,
        }));

        // Insertar en MongoDB
        const result = await Comercio.insertMany(comerciosTransformados);
        console.log(`✅ ${result.length} comercios migrados exitosamente`);

        // Mostrar resumen
        console.log("\n📊 Resumen de migración:");
        result.forEach((c, i) => {
            console.log(
                `  ${i + 1}. ${c.nombre} (${c.rubro}) - ${c.productos.length} productos`
            );
        });

        console.log("\n✨ Migración completada exitosamente!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error en la migración:", error);
        process.exit(1);
    }
};

migrarComercios();
