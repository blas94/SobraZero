import { useEffect, useState } from "react";
import { http } from "@/services/http-client";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
    const [estado, setEstado] = useState("Cargando...");

    useEffect(() => {
        (async () => {
            try {
                await http.get("/ping");
                setEstado("Backend conectado correctamente.");
            } catch (e) {
                const msg =
                    e?.response?.data?.error || e?.message || "No se pudo verificar";
                setEstado("ERROR: " + msg);
            }
        })();
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Dashboard de AdministraciÃ³n</h1>
            <p className="text-sm text-muted-foreground mb-6">{estado}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    to="/admin/usuarios"
                    className="rounded-xl border p-4 hover:bg-muted transition"
                >
                    <h2 className="font-semibold">Usuarios</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestionar roles y cuentas
                    </p>
                </Link>

                <Link
                    to="/admin/comercios"
                    className="rounded-xl border p-4 hover:bg-muted transition"
                >
                    <h2 className="font-semibold">Comercios</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestionar comercios
                    </p>
                </Link>
            </div>
        </div>
    );
}