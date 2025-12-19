import { Fragment, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";
import AdminNav from "@/components/admin/AdminNav";

const fecha = (f) => (f ? new Date(f).toLocaleString("es-AR") : "-");
const estadoUI = (s) => String(s || "-").toUpperCase();

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [abiertos, setAbiertos] = useState(() => new Set());
    const [reservas, setReservas] = useState({}); // { userId: [] }

    const cargar = async () => {
        setCargando(true);
        try {
            const data = await apiFetch("/admin/usuarios");
            setUsuarios(Array.isArray(data?.usuarios) ? data.usuarios : []);
        } catch (e) {
            toast.error(e.message || "Error cargando usuarios");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const toggle = async (userId) => {
        const id = String(userId);

        setAbiertos((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

        // cache
        if (reservas[id]) return;

        try {
            const data = await apiFetch(`/admin/usuarios/${id}/reservas`);
            setReservas((prev) => ({
                ...prev,
                [id]: Array.isArray(data?.reservas) ? data.reservas : [],
            }));
        } catch {
            toast.error("No se pudieron cargar las reservas");
            setReservas((prev) => ({ ...prev, [id]: [] }));
        }
    };

    const cambiarRol = async (id, rolActual, email) => {
        const nuevoRol = rolActual === "admin" ? "user" : "admin";

        const ok = window.confirm(
            nuevoRol === "admin"
                ? `¿Confirmás dar permisos de ADMIN a:\n\n${email || id}?`
                : `¿Confirmás quitar permisos de ADMIN a:\n\n${email || id}?`
        );
        if (!ok) return;

        try {
            await apiFetch(`/admin/usuarios/${id}/rol`, {
                method: "PUT",
                body: JSON.stringify({ rol: nuevoRol }),
            });
            toast.success("Rol actualizado");
            cargar();
        } catch (e) {
            toast.error(e.message || "No se pudo actualizar el rol");
        }
    };

    const eliminarUsuario = async (id, email) => {
        const ok = window.confirm(
            `¿Seguro que querés eliminar este usuario?\n\n${email || id}\n\nEsta acción no se puede deshacer.`
        );
        if (!ok) return;

        try {
            await apiFetch(`/admin/usuarios/${id}`, { method: "DELETE" });
            toast.success("Usuario eliminado");
            // limpiar cache de reservas/abiertos por si estaba abierto
            setReservas((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            setAbiertos((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            cargar();
        } catch (e) {
            toast.error(e.message || "No se pudo eliminar");
        }
    };

    const usuariosFiltrados = useMemo(() => {
        const q = String(busqueda || "").trim().toLowerCase();
        if (!q) return usuarios;

        return usuarios.filter((u) => {
            return (
                String(u?.nombre || "").toLowerCase().includes(q) ||
                String(u?.email || "").toLowerCase().includes(q) ||
                String(u?.tel || "").toLowerCase().includes(q) ||
                String(u?.rol || "").toLowerCase().includes(q)
            );
        });
    }, [usuarios, busqueda]);

    if (cargando) return <p className="p-6">Cargando usuarios…</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <AdminNav />

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
                                <th className="p-2 text-center">Detalle</th>
                            </tr>
                        </thead>

                        <tbody>
                            {usuariosFiltrados.map((u, idx) => {
                                const id = String(u?._id ?? idx);
                                const rol = String(u?.rol || "user");
                                const abierto = abiertos.has(id);
                                const listaReservas = reservas[id] || [];

                                return (
                                    <Fragment key={id}>
                                        <tr className="border-b hover:bg-muted/50">
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
                                                    onClick={() => cambiarRol(id, rol, u?.email)}
                                                    className="text-primary hover:underline text-sm"
                                                >
                                                    {rol === "admin" ? "Quitar admin" : "Hacer admin"}
                                                </button>

                                                <button
                                                    onClick={() => eliminarUsuario(id, u?.email)}
                                                    className="text-red-500 hover:underline text-sm ml-3"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>

                                            <td className="p-2 text-center">
                                                <button
                                                    onClick={() => toggle(id)}
                                                    className="text-primary hover:underline text-sm"
                                                >
                                                    {abierto ? "Ocultar" : "Ver"}
                                                </button>
                                            </td>
                                        </tr>

                                        {abierto && (
                                            <tr className="bg-muted/20 border-b">
                                                <td colSpan={6} className="p-3">
                                                    {listaReservas.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            Este usuario no tiene reservas.
                                                        </p>
                                                    ) : (
                                                        <table className="w-full text-sm border rounded">
                                                            <thead className="bg-muted">
                                                                <tr className="border-b">
                                                                    <th className="p-2 text-left">Reserva</th>
                                                                    <th className="p-2 text-center">Cantidad</th>
                                                                    <th className="p-2 text-center">Estado</th>
                                                                    <th className="p-2 text-center">Fecha</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {listaReservas.map((r, i) => (
                                                                    <tr key={r?._id || i} className="border-b">
                                                                        <td className="p-2">{r?.ofertaId || "-"}</td>
                                                                        <td className="p-2 text-center">
                                                                            {r?.cantidad ?? "-"}
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            {estadoUI(r?.estado)}
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            {fecha(r?.createdAt)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}