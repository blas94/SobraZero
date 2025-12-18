import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargar = async () => {
        setCargando(true);
        try {
            const data = await apiFetch("/api/admin/usuarios");
            setUsuarios(data.usuarios);
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

    if (cargando) return <p>Cargando usuarios…</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

            <table className="w-full border">
                <thead>
                    <tr className="border-b">
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2">Rol</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u._id} className="border-b">
                            <td className="p-2">{u.nombre}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2 text-center">{u.rol}</td>
                            <td className="p-2 text-center">
                                <button
                                    onClick={() => cambiarRol(u._id, u.rol)}
                                    className="text-primary hover:underline"
                                >
                                    {u.rol === "admin" ? "Quitar admin" : "Hacer admin"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
