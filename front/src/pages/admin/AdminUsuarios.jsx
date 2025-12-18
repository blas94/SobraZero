import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const cargar = async () => {
        setCargando(true);
        try {
            const data = await apiFetch("/api/admin/usuarios");
            setUsuarios(Array.isArray(data?.usuarios) ? data.usuarios : []);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const cambiarRol = async (id, rolActual) => {
        const nuevoRol = rolActual === "admin" ? "user" : "admin";
        try {
            await apiFetch(`/api/admin/usuarios/${id}/rol`, {
                method: "PUT",
                body: JSON.stringify({ rol: nuevoRol }),
            });
            toast.success("Rol actualizado");
            cargar();
        } catch (e) {
            toast.error(e.message);
        }
    };

    const usuariosFiltrados = useMemo(() => {
        const q = String(busqueda || "").trim().toLowerCase();
        if (!q) return usuarios;

        return usuarios.filter((u) => {
            const nombre = String(u?.nombre || "");
            const email = String(u?.email || "");
            const tel = String(u?.tel || "");
            const rol = String(u?.rol || "");

            return (
                nombre.toLowerCase().includes(q) ||
                email.toLowerCase().includes(q) ||
                tel.toLowerCase().includes(q) ||
                rol.toLowerCase().includes(q)
            );
        });
    }, [usuarios, busqueda]);

    if (cargando) return <p className="p-6">Cargando usuarios…</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

            <input
                type="text"
                placeholder="Buscar por nombre, email, teléfono o rol…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="mb-4 w-full max-w-sm border rounded px-3 py-2"
            />

            {usuariosFiltrados.length === 0 ? (
                <p className="text-muted-foreground">No hay usuarios para mostrar.</p>
            ) : (
                <div className="overflow-auto border rounded">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr className="border-b">
                                <th className="p-2 text-left">Nombre</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Tel</th>
                                <th className="p-2 text-center">Rol</th>
                                <th className="p-2 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.map((u, idx) => {
                                const id = u?._id || u?.id || `fila-${idx}`;
                                const rol = String(u?.rol || "user");

                                return (
                                    <tr key={id} className="border-b hover:bg-muted/50">
                                        <td className="p-2">{u?.nombre || "-"}</td>
                                        <td className="p-2">{u?.email || "-"}</td>
                                        <td className="p-2">{u?.tel || "-"}</td>
                                        <td className="p-2 text-center">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${rol === "admin"
                                                        ? "bg-yellow-200 text-yellow-800"
                                                        : "bg-gray-200 text-gray-700"
                                                    }`}
                                            >
                                                {rol}
                                            </span>
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => cambiarRol(id, rol)}
                                                className="text-primary hover:underline text-sm"
                                            >
                                                {rol === "admin" ? "Quitar admin" : "Hacer admin"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}