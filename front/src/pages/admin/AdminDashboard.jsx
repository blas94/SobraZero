import { useEffect, useState } from "react";
import { http } from "@/services/http-client";

export default function AdminDashboard() {
    const [estado, setEstado] = useState("Cargando...");

    useEffect(() => {
        (async () => {
            try {
                await http.get("/ping");
                setEstado("OK: el backend respondiÃ³ correctamente (/api/ping).");
            } catch (e) {
                const msg =
                    e?.response?.data?.error || e?.message || "No se pudo verificar";
                setEstado("ERROR: " + msg);
            }
        })();
    }, []);

    return (
        <div>
            <h1>Dashboard Admin</h1>
            <p>{estado}</p>
        </div>
    );
}
