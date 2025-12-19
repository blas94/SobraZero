import { Clock, MapPin, Package } from "lucide-react";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Insignia } from "@/components/ui/Insignia";
import { Boton } from "@/components/ui/Boton";
import NavegacionInferior from "@/components/NavegacionInferior";
import FormasDecorativas from "@/components/FormasDecorativas";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Plegable,
  ContenidoPlegable,
  ActivadorPlegable,
} from "@/components/ui/Plegable";
import { authHttp } from "@/services/http-client";

const ESTADOS_FILTRO = [
  { id: "en-curso", etiqueta: "En curso" },
  { id: "historial", etiqueta: "Historial" },
];

const normalizarEstado = (valor = "") => {
  const estado = valor.toString().toLowerCase();

  if (["pending", "pendiente"].includes(estado)) return "pendiente";

  if (["paid", "pagado", "pagada", "approved"].includes(estado)) return "pagada";

  if (["picked_up", "retirado", "retirada"].includes(estado)) return "retirada";

  if (["cancelled", "cancelado", "cancelada"].includes(estado)) return "cancelada";

  if (["expired", "expirada"].includes(estado)) return "expirada";

  return "completado";
};

const obtenerNombreComercio = (pedido) =>
  pedido.nombreComercio || pedido.storeName || "Comercio";

const obtenerEtiquetaEstado = (estado) => {
  switch (normalizarEstado(estado)) {
    case "pendiente":
      return "En curso";
    case "pagada":
      return "Pagado";
    case "retirada":
      return "Retirado";
    case "cancelada":
      return "Cancelado";
    case "expirada":
      return "Expirado";
    default:
      return "Completado";
  }
};

const obtenerVarianteEstado = (estado) => {
  switch (normalizarEstado(estado)) {
    case "pendiente":
      return "default";
    case "pagada":
      return "secondary";
    case "retirada":
      return "secondary";
    case "cancelada":
      return "destructive";
    case "expirada":
      return "destructive";
    default:
      return "secondary";
  }
};

const ItemPedido = ({ pedido, manejarReorden }) => {
  const estadoNormalizado = normalizarEstado(pedido.estado || pedido.status);
  const productos = pedido.productos || pedido.products || [];
  const cantidadProductos = productos.length || 0;

  return (
    <Tarjeta className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold">{obtenerNombreComercio(pedido)}</h2>
          <p className="text-xs text-muted-foreground">
            {pedido.fecha || pedido.date || "—"}
          </p>
        </div>
        <Insignia variant={obtenerVarianteEstado(estadoNormalizado)}>
          {obtenerEtiquetaEstado(estadoNormalizado)}
        </Insignia>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{pedido.direccion || pedido.address || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Retiro: {pedido.horarioRetiro || pedido.pickupTime || "—"}</span>
        </div>
      </div>

      <Plegable className="mt-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <ActivadorPlegable className="text-sm text-green-600 underline cursor-pointer hover:text-green-700">
            {cantidadProductos} {cantidadProductos === 1 ? "producto" : "productos"}
          </ActivadorPlegable>
        </div>
        <ContenidoPlegable className="mt-2">
          <div className="p-3 bg-muted/50 rounded-md">
            <ul className="space-y-1.5">
              {productos.map((producto, index) => (
                <li key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {producto.nombre || producto.name || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Unidades: {producto.cantidad ?? producto.quantity ?? "—"}
                      {producto.weight && `  Peso: ${producto.weight} kilo/s`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ContenidoPlegable>
      </Plegable>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Total</span>
          <span className="text-lg font-bold text-primary">
            ${Number(pedido.total || 0).toLocaleString("es-AR")}
          </span>
        </div>

        {normalizarEstado(pedido.estado || pedido.status) === "retirada" && (
          <Boton onClick={() => manejarReorden(pedido)} className="w-full" size="sm">
            Volver a pedir
          </Boton>
        )}
      </div>
    </Tarjeta>
  );
};

const Pedidos = () => {
  const [filtroEstado, setFiltroEstado] = useState("en-curso");
  const ultimoValorRef = useRef(localStorage.getItem("pedidos"));

  const [pedidos, setPedidos] = useState(() => {
    try {
      const raw = localStorage.getItem("pedidos");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const obtenerUsuarioId = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?._id || u?.id || u?.uid || null;
    } catch {
      return null;
    }
  };

  const sincronizarEstadosDesdeBackend = async () => {
    const usuarioId = obtenerUsuarioId();
    if (!usuarioId) return;

    const resp = await authHttp.get(`/reservas/usuario/${usuarioId}`);
    const reservas = resp?.data?.reservas || [];


    const estadoPorReservaId = new Map(
      reservas.map((r) => [String(r._id), r.estado])
    );

    const raw = localStorage.getItem("pedidos");
    if (!raw) return;

    let arr = [];
    try {
      arr = JSON.parse(raw);
    } catch {
      return;
    }

    const actualizado = arr.map((p) => {
      const idLocal = String(p?.id || p?._id || p?.reservaId || "");
      const nuevoEstado = estadoPorReservaId.get(idLocal);
      if (!nuevoEstado) return p;
      return { ...p, estado: nuevoEstado };
    });

    localStorage.setItem("pedidos", JSON.stringify(actualizado));
    ultimoValorRef.current = JSON.stringify(actualizado);
    setPedidos(actualizado);
  };


  useEffect(() => {
    const run = async () => {
      try {

        const forzar = sessionStorage.getItem("sobrazero_refetch_pedidos") === "1";
        if (forzar) sessionStorage.removeItem("sobrazero_refetch_pedidos");


        await sincronizarEstadosDesdeBackend();
      } catch (e) {

        console.log("[Pedidos] No se pudo sincronizar estados:", e?.message || e);
      }
    };

    run();
  }, []);

  useEffect(() => {
    const manejarCambioStorage = () => {
      const valorActual = localStorage.getItem("pedidos");
      if (valorActual !== ultimoValorRef.current) {
        ultimoValorRef.current = valorActual;
        setPedidos(valorActual ? JSON.parse(valorActual) : []);
      }
    };

    window.addEventListener("storage", manejarCambioStorage);
    const interval = setInterval(manejarCambioStorage, 1000);

    return () => {
      window.removeEventListener("storage", manejarCambioStorage);
      clearInterval(interval);
    };
  }, []);

  const manejarReorden = async (pedido) => {
    try {
      const usuarioId = obtenerUsuarioId();
      if (!usuarioId) {
        toast.error("No pude encontrar tu usuario. Iniciá sesión de nuevo.");
        return;
      }

      const comercioId =
        pedido.comercioId || pedido.storeId || pedido.comercio?._id;
      if (!comercioId) {
        toast.error("Este pedido no tiene comercioId para volver a pedir.");
        return;
      }

      const productos = pedido.productos || pedido.products || [];
      const primerProd = productos[0];

      const productoNombre = primerProd?.nombre || primerProd?.name;
      if (!productoNombre) {
        toast.error("Este pedido no tiene productoNombre para volver a pedir.");
        return;
      }

      const cantidadRaw = primerProd?.cantidad || primerProd?.quantity || 1;
      const cantidad = Number(String(cantidadRaw).match(/\d+/)?.[0] || 1);

      const r1 = await authHttp.post("/reservas", {
        usuarioId,
        comercioId,
        productoNombre,
        cantidad,
      });

      const reservaId = r1?.data?.reserva?._id;
      if (!reservaId) {
        toast.error("La reserva no devolvió un ID válido.");
        return;
      }

      const precio_total = Number(pedido.total || 0);

      const r2 = await authHttp.post("/pagos/crear-preferencia", {
        reservaId,
        precio_total,
      });

      const checkoutUrl = r2?.data?.checkout_url;
      if (!checkoutUrl) {
        toast.error("No llegó checkout_url desde Mercado Pago.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (e) {
      toast.error("No se pudo iniciar el pago para volver a pedir.");
    }
  };

  const pedidosFiltrados =
    filtroEstado === "en-curso"
      ? pedidos.filter((p) => {
        const e = normalizarEstado(p.estado || p.status);
        return e === "pendiente" || e === "pagada";
      })
      : pedidos.filter((p) => {
        const e = normalizarEstado(p.estado || p.status);
        return e === "retirada" || e === "cancelada" || e === "expirada";
      });

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {ESTADOS_FILTRO.map((estado) => (
              <Boton
                key={estado.id}
                variant={filtroEstado === estado.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroEstado(estado.id)}
              >
                {estado.etiqueta}
              </Boton>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 relative z-10">
        {pedidosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No tenés pedidos</h2>
            <p className="text-sm text-muted-foreground">
              Cuando reserves una bolsa sorpresa, aparecerá aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => (
              <ItemPedido
                key={pedido.id || pedido._id}
                pedido={pedido}
                manejarReorden={manejarReorden}
              />
            ))}
          </div>
        )}
      </main>

      <NavegacionInferior />
    </div>
  );
};

export default Pedidos;