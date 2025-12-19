import { Fragment, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";
import { Boton } from "@/components/ui/Boton";
import AdminNav from "@/components/admin/AdminNav";
import BadgeEstadoComercio from "@/components/admin/BadgeEstadoComercio";
import ModalRechazarComercio from "@/components/admin/ModalRechazarComercio";

const normalizarComercio = (c) => {
    const obj = c && typeof c === "object" ? c : {};
    return {
        ...obj,
        alias: obj.alias ?? obj.apodo ?? obj.nickname ?? "",
        telefono: obj.telefono ?? obj.tel ?? "Sin teléfono",
        productos: Array.isArray(obj.productos) ? obj.productos : [],
    };
};

const money = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return "-";
    return `$${num.toLocaleString("es-AR")} `;
};

const fecha = (f) => (f ? new Date(f).toLocaleString("es-AR") : "-");

const norm = (s) =>
    String(s ?? "")
        .trim()
        .toLowerCase();

export default function AdminComercios() {
    const [comercios, setComercios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [abiertos, setAbiertos] = useState(() => new Set());
    const [modalRechazar, setModalRechazar] = useState({ open: false, comercio: null });
    const [reservasPorComercio, setReservasPorComercio] = useState({});
    const [cargandoReservas, setCargandoReservas] = useState({});

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
        const q = norm(busqueda);
        if (!q) return comercios;

        return comercios.filter((c) => {
            const nombre = norm(c?.nombre);
            const alias = norm(c?.alias);
            const rubro = norm(c?.rubro);
            const direccion = norm(c?.direccion);
            const telefono = norm(c?.telefono);

            return (
                nombre.includes(q) ||
                alias.includes(q) ||
                rubro.includes(q) ||
                direccion.includes(q) ||
                telefono.includes(q)
            );
        });
    }, [comercios, busqueda]);

    const fetchReservas = async (comercioId) => {
        const id = String(comercioId);

        if (reservasPorComercio[id]) return;

        setCargandoReservas((prev) => ({ ...prev, [id]: true }));
        try {
            const data = await apiFetch(`/ admin / comercios / ${id}/reservas`);
            setReservasPorComercio((prev) => ({
                ...prev,
                [id]: Array.isArray(data?.reservas) ? data.reservas : [],
            }));
        } catch (e) {
            toast.error(
                e?.message || "No se pudieron cargar las reservas del comercio"
            );
            setReservasPorComercio((prev) => ({ ...prev, [id]: [] }));
        } finally {
            setCargandoReservas((prev) => ({ ...prev, [id]: false }));
        }
    };

    const toggle = async (id) => {
        const sid = String(id);

        setAbiertos((prev) => {
            const next = new Set(prev);
            if (next.has(sid)) next.delete(sid);
            else next.add(sid);
            return next;
        });

        const vaAAbrir = !abiertos.has(sid);
        if (vaAAbrir) await fetchReservas(sid);
    };

    const cambiarEstadoReserva = async (reservaId, nuevoEstado, comercioId) => {
        try {
            await apiFetch(`/admin/reservas/${reservaId}/estado`, {
                method: "PUT",
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            const cid = String(comercioId);
            setReservasPorComercio((prev) => {
                const arr = Array.isArray(prev[cid]) ? prev[cid] : [];
                return {
                    ...prev,
                    [cid]: arr.map((r) =>
                        String(r?._id) === String(reservaId)
                            ? { ...r, estado: nuevoEstado }
                            : r
                    ),
                };
            });

            toast.success(`Reserva marcada como ${nuevoEstado.toUpperCase()}`);
        } catch (e) {
            toast.error(e?.message || "No se pudo actualizar el estado");
        }
    };

    const aprobarComercio = async (comercioId) => {
        try {
            await apiFetch(`/admin/comercios/${comercioId}/aprobar`, {
                method: "PUT",
            });
            // Actualizar lista local
            setComercios((prev) =>
                prev.map((c) =>
                    String(c._id) === String(comercioId)
                        ? { ...c, estadoAprobacion: "aprobado" }
                        : c
                )
            );
            toast.success("Comercio aprobado exitosamente");
        } catch (e) {
            toast.error(e?.message || "No se pudo aprobar el comercio");
        }
    };
    const rechazarComercio = async (razon) => {
        if (!modalRechazar.comercio) return;
        try {
            await apiFetch(`/admin/comercios/${modalRechazar.comercio._id}/rechazar`, {
                method: "PUT",
                body: JSON.stringify({ razon }),
            });
            // Actualizar lista local
            setComercios((prev) =>
                prev.map((c) =>
                    String(c._id) === String(modalRechazar.comercio._id)
                        ? { ...c, estadoAprobacion: "rechazado", razonRechazo: razon }
                        : c
                )
            );
            setModalRechazar({ open: false, comercio: null });
            toast.success("Comercio rechazado");
        } catch (e) {
            toast.error(e?.message || "No se pudo rechazar el comercio");
        }
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
                placeholder="Buscar por nombre, alias, rubro, dirección o teléfono…"
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
                                <th className="p-2 text-left">Alias</th>
                                <th className="p-2 text-left">Rubro</th>
                                <th className="p-2 text-left">Dirección</th>
                                <th className="p-2 text-left">Teléfono</th>
                                <th className="p-2 text-center">Estado</th>
                                <th className="p-2 text-center">Calificación</th>
                                <th className="p-2 text-center">Productos</th>
                                <th className="p-2 text-center">Pedidos</th>
                                <th className="p-2 text-center w-48">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtrados.map((c, idx) => {
                                const id = String(c?._id ?? idx);
                                const abierto = abiertos.has(id);

                                const reservas = reservasPorComercio[id] || [];
                                const pedidosCount =
                                    typeof c?.pedidosCount === "number"
                                        ? c.pedidosCount
                                        : reservas.length;

                                return (
                                    <Fragment key={id}>
                                        <tr className="border-b hover:bg-muted/50">
                                            <td className="p-2">{c?.nombre || "-"}</td>
                                            <td className="p-2">{c?.alias || "-"}</td>
                                            <td className="p-2">{c?.rubro || "-"}</td>
                                            <td className="p-2">{c?.direccion || "-"}</td>
                                            <td className="p-2">{c?.telefono || "-"}</td>
                                            <td className="p-2 text-center">
                                                <BadgeEstadoComercio estado={c?.estadoAprobacion} />
                                            </td>
                                            <td className="p-2 text-center">
                                                {c?.calificacionPromedio ?? "-"}
                                            </td>
                                            <td className="p-2 text-center">
                                                {Array.isArray(c?.productos) ? c.productos.length : 0}
                                            </td>
                                            <td className="p-2 text-center">{pedidosCount}</td>
                                            <td className="p-2 text-center">
                                                <div className="flex gap-2 justify-center items-center flex-wrap">
                                                    {c?.estadoAprobacion === "pendiente" && (
                                                        <div className="flex gap-2">
                                                            <Boton
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => aprobarComercio(c._id)}
                                                                className="min-w-[90px] border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                                                            >
                                                                ✓ Aprobar
                                                            </Boton>
                                                            <Boton
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setModalRechazar({ open: true, comercio: c })}
                                                                className="min-w-[90px] border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300"
                                                            >
                                                                ✕ Rechazar
                                                            </Boton>
                                                        </div>
                                                    )}
                                                    <Boton
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => toggle(id)}
                                                    >
                                                        {abierto ? "Ocultar" : "Ver"}
                                                    </Boton>
                                                </div>
                                            </td>
                                        </tr>

                                        {abierto && (
                                            <tr className="border-b bg-muted/20">
                                                <td className="p-3" colSpan={9}>
                                                    <div className="mb-6">
                                                        <h3 className="font-semibold mb-2">Productos</h3>

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
                                                                            <th className="p-2 text-left">
                                                                                Producto
                                                                            </th>
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
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-semibold">
                                                                Pedidos (Reservas)
                                                            </h3>
                                                            {cargandoReservas[id] ? (
                                                                <span className="text-xs text-muted-foreground">
                                                                    Cargando…
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        {cargandoReservas[id] ? (
                                                            <p className="text-sm text-muted-foreground">
                                                                Cargando reservas del comercio…
                                                            </p>
                                                        ) : reservas.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground">
                                                                Este comercio no tiene pedidos.
                                                            </p>
                                                        ) : (
                                                            <div className="overflow-auto">
                                                                <table className="w-full text-sm border rounded">
                                                                    <thead className="bg-muted">
                                                                        <tr className="border-b">
                                                                            <th className="p-2 text-left">Usuario</th>
                                                                            <th className="p-2 text-left">
                                                                                Producto
                                                                            </th>
                                                                            <th className="p-2 text-center">
                                                                                Cantidad
                                                                            </th>
                                                                            <th className="p-2 text-center">
                                                                                $ Unit
                                                                            </th>
                                                                            <th className="p-2 text-center">
                                                                                $ Total
                                                                            </th>
                                                                            <th className="p-2 text-center">
                                                                                Estado
                                                                            </th>
                                                                            <th className="p-2 text-center">
                                                                                PAGADA
                                                                            </th>
                                                                            <th className="p-2 text-center">Fecha</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {reservas.map((r, i) => {
                                                                            const rid = String(r?._id ?? i);
                                                                            const estado = String(r?.estado || "-");
                                                                            const productoNombre = String(
                                                                                r?.productoNombre || "-"
                                                                            );
                                                                            const cantidad = Number(r?.cantidad ?? 0);

                                                                            const prod = (
                                                                                Array.isArray(c?.productos)
                                                                                    ? c.productos
                                                                                    : []
                                                                            ).find(
                                                                                (p) =>
                                                                                    norm(p?.nombre) ===
                                                                                    norm(productoNombre)
                                                                            );

                                                                            const unit =
                                                                                prod?.precioDescuento ??
                                                                                prod?.precioOriginal ??
                                                                                null;

                                                                            const total =
                                                                                unit == null ||
                                                                                    Number.isNaN(Number(unit))
                                                                                    ? null
                                                                                    : Number(unit) *
                                                                                    (Number.isNaN(cantidad)
                                                                                        ? 0
                                                                                        : cantidad);

                                                                            const pagada = estado === "pagada";

                                                                            return (
                                                                                <tr key={rid} className="border-b">
                                                                                    <td className="p-2">
                                                                                        {r?.usuarioId?.nombre ||
                                                                                            r?.usuarioId?.email ||
                                                                                            String(r?.usuarioId || "-")}
                                                                                    </td>
                                                                                    <td className="p-2">
                                                                                        {productoNombre}
                                                                                    </td>
                                                                                    <td className="p-2 text-center">
                                                                                        {cantidad || "-"}
                                                                                    </td>
                                                                                    <td className="p-2 text-center">
                                                                                        {unit == null ? "-" : money(unit)}
                                                                                    </td>
                                                                                    <td className="p-2 text-center">
                                                                                        {total == null ? "-" : money(total)}
                                                                                    </td>
                                                                                    <td className="p-2 text-center">
                                                                                        {estado === "-"
                                                                                            ? "-"
                                                                                            : estado.toUpperCase()}
                                                                                    </td>
                                                                                    <td className="p-2 text-center">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={pagada}
                                                                                            onChange={(e) => {
                                                                                                const nuevo = e.target.checked
                                                                                                    ? "pagada"
                                                                                                    : "pendiente";
                                                                                                cambiarEstadoReserva(
                                                                                                    rid,
                                                                                                    nuevo,
                                                                                                    id
                                                                                                );
                                                                                            }}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="p-2 text-center">
                                                                                        {fecha(r?.createdAt)}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
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
            <ModalRechazarComercio
                open={modalRechazar.open}
                onOpenChange={(open) => setModalRechazar({ open, comercio: null })}
                onConfirm={rechazarComercio}
                nombreComercio={modalRechazar.comercio?.nombre || ""}
            />
        </div>
    );
}
