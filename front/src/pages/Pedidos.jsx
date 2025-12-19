import { Clock, MapPin, Package } from "lucide-react";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Insignia } from "@/components/ui/Insignia";
import { Boton } from "@/components/ui/Boton";
import NavegacionInferior from "@/components/NavegacionInferior";
import FormasDecorativas from "@/components/FormasDecorativas";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plegable,
  ContenidoPlegable,
  ActivadorPlegable,
} from "@/components/ui/Plegable";
import { authHttp } from "@/services/http-client";

/* =======================
   Helpers de estado
======================= */

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
    case "retirada":
      return "secondary";
    case "cancelada":
    case "expirada":
      return "destructive";
    default:
      return "secondary";
  }
};

/* =======================
   Card Pedido
======================= */

const ItemPedido = ({ pedido }) => {
  const estado = normalizarEstado(pedido.estado);

  // Obtener horario de hoy
  const obtenerHorarioHoy = () => {
    console.log("🔍 [DEBUG] comercioId completo:", pedido.comercioId);
    console.log("🔍 [DEBUG] horarios:", pedido.comercioId?.horarios);
    if (!pedido.comercioId?.horarios) return "No disponible";

    const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long' }).toLowerCase();
    const horarioHoy = pedido.comercioId.horarios.find(h => h.dia === hoy);

    if (horarioHoy && horarioHoy.abierto) {
      return `${horarioHoy.horaApertura} - ${horarioHoy.horaCierre}`;
    }
    return "Cerrado hoy";
  };

  return (
    <Tarjeta className="p-4 !bg-white !opacity-100 relative z-10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold">
            {pedido.nombreComercio || "Comercio"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {new Date(pedido.createdAt).toLocaleString("es-AR")}
          </p>
        </div>

        <Insignia variant={obtenerVarianteEstado(estado)}>
          {obtenerEtiquetaEstado(estado)}
        </Insignia>
      </div>

      {/* Información del comercio */}
      {pedido.comercioId && (
        <div className="space-y-1 mb-3 text-sm text-muted-foreground">
          {pedido.comercioId.direccion && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{pedido.comercioId.direccion}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Horario hoy: {obtenerHorarioHoy()}</span>
          </div>
        </div>
      )}

      <Plegable className="mt-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <ActivadorPlegable className="text-sm text-green-600 underline cursor-pointer">
            1 producto
          </ActivadorPlegable>
        </div>

        <ContenidoPlegable className="mt-2">
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="flex justify-between text-sm">
              <span>{pedido.productoNombre}</span>
              <span>Cantidad: {pedido.cantidad}</span>
            </div>
          </div>
        </ContenidoPlegable>
      </Plegable>
    </Tarjeta>
  );
};

/* =======================
   Página Pedidos
======================= */

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("en-curso");
  const [cargando, setCargando] = useState(true);

  const obtenerUsuarioId = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      const usuarioId = u?.id || u?._id || null;
      console.log("🔍 [PEDIDOS] Usuario obtenido:", { id: u?.id, _id: u?._id, usuarioId });
      return usuarioId;
    } catch {
      return null;
    }
  };

  /* ===== CARGA REAL DESDE BACKEND ===== */
  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const usuarioId = obtenerUsuarioId();
        if (!usuarioId) {
          setPedidos([]);
          return;
        }

        const res = await authHttp.get(`/reservas/usuario/${usuarioId}`);
        setPedidos(res.data.reservas || []);
      } catch (e) {
        console.error(e);
        toast.error("No se pudieron cargar tus pedidos");
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, []);


  const pedidosFiltrados =
    filtroEstado === "en-curso"
      ? pedidos.filter((p) =>
        ["pendiente", "pagada"].includes(normalizarEstado(p.estado))
      )
      : pedidos.filter((p) =>
        ["retirada", "cancelada", "expirada"].includes(
          normalizarEstado(p.estado)
        )
      );

  return (
    <div className="min-h-screen bg-white pb-20 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>

          <div className="flex gap-2">
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

      <main className="px-4 py-4">
        {cargando ? (
          <p className="text-center text-muted-foreground">Cargando pedidos…</p>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p>No tenés pedidos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => (
              <ItemPedido key={pedido._id} pedido={pedido} />
            ))}
          </div>
        )}
      </main>

      <NavegacionInferior />
    </div>
  );
};

export default Pedidos;