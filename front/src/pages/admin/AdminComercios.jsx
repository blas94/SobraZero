import { Fragment, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";
import AdminNav from "@/components/admin/AdminNav";


const normalizarComercio = (c) => {
    const obj = c && typeof c === "object" ? c : {};
    return {
        ...obj,
        telefono: obj.telefono ?? obj.tel ?? "Sin teléfono",
        productos: Array.isArray(obj.productos) ? obj.productos : [],
    };
};

const money = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return "-";
    return `$${num.toLocaleString("es-AR")}`;
};

export default function AdminComercios() {
    const [comercios, setComercios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [abiertos, setAbiertos] = useState(() => new Set());

    const cargar = async () => {
        setCargando(true);
        try {
            const data = await apiFetch("/admin/comercios");
            const lista = Array.isArray(data?.comercios)
                ? data.comercios
                : Array.isArray(data)
                    ? data
                    : [];
            setComercios(lista.map(normalizarComercio));
        } catch (e) {
            toast.error(e.message || "No se pudieron cargar los comercios");
            setComercios([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const filtrados = useMemo(() => {
        const q = String(busqueda || "")
            .trim()
            .toLowerCase();
        if (!q) return comercios;

        return comercios.filter((c) => {
            const nombre = String(c?.nombre || "").toLowerCase();
            const rubro = String(c?.rubro || "").toLowerCase();
            const direccion = String(c?.direccion || "").toLowerCase();
            const telefono = String(c?.telefono || "").toLowerCase();

            return (
                nombre.includes(q) ||
                rubro.includes(q) ||
                direccion.includes(q) ||
                telefono.includes(q)
            );
        });
    }, [comercios, busqueda]);

    const toggle = (id) => {
        const sid = String(id);
        setAbiertos((prev) => {
            const next = new Set(prev);
            if (next.has(sid)) next.delete(sid);
            else next.add(sid);
            return next;
        });
    };

    if (cargando) return <p className="p-6">Cargando comercios…</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <AdminNav />
            <div className="flex items-end justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Comercios</h1>
                    <p className="text-sm text-muted-foreground">
                        Total cargados: {comercios.length}
                    </p>
                </div>
            </div>

            <input
                className="mb-4 w-full max-w-sm border rounded px-3 py-2"
                placeholder="Buscar por nombre, rubro, dirección o teléfono…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            {filtrados.length === 0 ? (
                <p className="text-muted-foreground">No hay comercios para mostrar.</p>
            ) : (
                <div className="overflow-auto border rounded">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr className="border-b">
                                <th className="p-2 text-left">Nombre</th>
                                <th className="p-2 text-left">Rubro</th>
                                <th className="p-2 text-left">Dirección</th>
                                <th className="p-2 text-left">Teléfono</th>
                                <th className="p-2 text-center">Calificación</th>
                                <th className="p-2 text-center">Productos</th>
                                <th className="p-2 text-center">Detalle</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtrados.map((c, idx) => {
                                const id = String(c?._id ?? idx);
                                const abierto = abiertos.has(id);

                                return (
                                    <Fragment key={id}>
                                        <tr className="border-b hover:bg-muted/50">
                                            <td className="p-2">{c?.nombre || "-"}</td>
                                            <td className="p-2">{c?.rubro || "-"}</td>
                                            <td className="p-2">{c?.direccion || "-"}</td>
                                            <td className="p-2">{c?.telefono || "-"}</td>
                                            <td className="p-2 text-center">
                                                {c?.calificacionPromedio ?? "-"}
                                            </td>
                                            <td className="p-2 text-center">
                                                {Array.isArray(c?.productos) ? c.productos.length : 0}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => toggle(id)}
                                                    className="text-primary hover:underline"
                                                >
                                                    {abierto ? "Ocultar" : "Ver"}
                                                </button>
                                            </td>
                                        </tr>

                                        {abierto && (
                                            <tr className="border-b bg-muted/20">
                                                <td className="p-3" colSpan={7}>
                                                    {!Array.isArray(c?.productos) ||
                                                        c.productos.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            Este comercio no tiene productos cargados.
                                                        </p>
                                                    ) : (
                                                        <div className="overflow-auto">
                                                            <table className="w-full text-sm border rounded">
                                                                <thead className="bg-muted">
                                                                    <tr className="border-b">
                                                                        <th className="p-2 text-left">Producto</th>
                                                                        <th className="p-2 text-center">Stock</th>
                                                                        <th className="p-2 text-center">Peso</th>
                                                                        <th className="p-2 text-center">
                                                                            Precio original
                                                                        </th>
                                                                        <th className="p-2 text-center">
                                                                            Precio desc.
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {c.productos.map((p, i) => {
                                                                        const pid = String(p?._id ?? p?.id ?? i);
                                                                        return (
                                                                            <tr key={pid} className="border-b">
                                                                                <td className="p-2">
                                                                                    {p?.nombre || "-"}
                                                                                </td>
                                                                                <td className="p-2 text-center">
                                                                                    {p?.stock ?? "-"}
                                                                                </td>
                                                                                <td className="p-2 text-center">
                                                                                    {p?.peso ?? "-"}
                                                                                </td>
                                                                                <td className="p-2 text-center">
                                                                                    {money(p?.precioOriginal)}
                                                                                </td>
                                                                                <td className="p-2 text-center">
                                                                                    {money(p?.precioDescuento)}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
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