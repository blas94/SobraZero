import { Clock, MapPin, Package, ChevronDown } from "lucide-react";
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

const ESTADOS_FILTRO = [
  { id: "en-curso", etiqueta: "En curso" },
  { id: "historial", etiqueta: "Historial" },
];

const normalizarEstado = (valor = "") => {
  const estado = valor.toString().toLowerCase();
  if (["pending", "pendiente"].includes(estado)) return "pendiente";
  if (["picked_up", "retirado"].includes(estado)) return "retirado";
  if (["cancelled", "cancelado"].includes(estado)) return "cancelado";
  return "completado";
};

const obtenerNombreComercio = (pedido) =>
  pedido.nombreComercio || pedido.storeName || "Comercio";

const obtenerEtiquetaEstado = (estado) => {
  switch (normalizarEstado(estado)) {
    case "pendiente":
      return "En curso";
    case "cancelado":
      return "Cancelado";
    case "retirado":
      return "Retirado";
    default:
      return "Completado";
  }
};

const obtenerVarianteEstado = (estado) => {
  switch (normalizarEstado(estado)) {
    case "pendiente":
      return "default";
    case "cancelado":
      return "destructive";
    case "retirado":
      return "secondary";
    default:
      return "secondary";
  }
};

const ItemPedido = ({ pedido, manejarReorden }) => {

  const estadoNormalizado = normalizarEstado(pedido.estado || pedido.status);
  const cantidadProductos = pedido.productos?.length || 0;
  const productos = pedido.productos || pedido.products || [];

  return (
    <Tarjeta className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold">{obtenerNombreComercio(pedido)}</h2>
          <p className="text-xs text-muted-foreground">
            {pedido.fecha || pedido.date}
          </p>
        </div>
        <Insignia variant={obtenerVarianteEstado(estadoNormalizado)}>
          {obtenerEtiquetaEstado(estadoNormalizado)}
        </Insignia>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{pedido.direccion || pedido.address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Retiro: {pedido.horarioRetiro || pedido.pickupTime}</span>
        </div>
      </div>

      <Plegable className="mt-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <ActivadorPlegable className="text-sm text-green-600 underline cursor-pointer hover:text-green-700">
            {cantidadProductos}{" "}
            {cantidadProductos === 1 ? "producto" : "productos"}
          </ActivadorPlegable>
        </div>
        <ContenidoPlegable className="mt-2">
          <div className="p-3 bg-muted/50 rounded-md">
            <ul className="space-y-1.5">
              {productos.map((producto, index) => (
                <li key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {producto.nombre || producto.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Unidades: {producto.cantidad || producto.quantity}
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
            ${pedido.total.toLocaleString()}
          </span>
        </div>

        {normalizarEstado(pedido.estado || pedido.status) === "retirado" && (
          <Boton
            onClick={() => manejarReorden(pedido)}
            className="w-full"
            size="sm"
          >
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
    const pedidosGuardados = localStorage.getItem("pedidos");
    if (!pedidosGuardados || JSON.parse(pedidosGuardados).length === 0) {
      const pedidosEjemplo = [
        {
          id: "ejemplo-1",
          nombreComercio: "Panadería Don Juan",
          estado: "pendiente",
          horarioRetiro: "18:00 - 20:00",
          direccion: "Av. Corrientes 2850, Balvanera",
          total: 1000,
          articulos: 1,
          fecha: "Hoy",
          productos: [
            { nombre: "Medialunas", cantidad: "6 unidades" },
            { nombre: "Pan francés", cantidad: "500 g" },
            { nombre: "Facturas surtidas", cantidad: "4 unidades" },
            { nombre: "Pan de campo", cantidad: "1 kg" },
          ],
        },
        {
          id: "ejemplo-2",
          nombreComercio: "Supermercado Express",
          estado: "retirado",
          horarioRetiro: "19:00 - 21:00",
          direccion: "Av. Pueyrredón 258, Balvanera",
          total: 3000,
          articulos: 2,
          fecha: "Ayer",
          productos: [
            { nombre: "Frutas de estación variadas", cantidad: "2 kg" },
            { nombre: "Verduras frescas mixtas", cantidad: "1.5 kg" },
            { nombre: "Lácteos (leche, yogurt)", cantidad: "3 unidades" },
            { nombre: "Pan del día", cantidad: "500 g" },
          ],
        },
        {
          id: "ejemplo-3",
          nombreComercio: "Restaurante La Estancia",
          estado: "cancelado",
          horarioRetiro: "20:00 - 21:30",
          direccion: "Av. Rivadavia 2380, Balvanera",
          total: 1500,
          articulos: 1,
          fecha: "Hace 2 días",
          productos: [
            {
              nombre: "Milanesa napolitana con guarnición",
              cantidad: "1 porción",
            },
            { nombre: "Tarta de verduras", cantidad: "1 porción" },
            {
              nombre: "Flan casero con dulce de leche",
              cantidad: "1 porción",
            },
          ],
        },
        {
          id: "ejemplo-4",
          nombreComercio: "Verdulería Los Andes",
          estado: "retirado",
          horarioRetiro: "17:00 - 19:00",
          direccion: "Av. Córdoba 2645, Balvanera",
          total: 1800,
          articulos: 2,
          fecha: "Hace 3 días",
          productos: [
            { nombre: "Tomates", cantidad: "1 kilo" },
            { nombre: "Lechuga", cantidad: "2 unidades" },
            { nombre: "Manzanas", cantidad: "1 kilo" },
            { nombre: "Zanahorias", cantidad: "medio kilo" },
          ],
        },
      ];
      localStorage.setItem("pedidos", JSON.stringify(pedidosEjemplo));
      return pedidosEjemplo;
    }
    return JSON.parse(pedidosGuardados);
  });

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

  const obtenerEtiquetaEstado = (estado) => {
    switch (normalizarEstado(estado)) {
      case "pendiente":
        return "En curso";
      case "cancelado":
        return "Cancelado";
      case "retirado":
        return "Retirado";
      default:
        return "Completado";
    }
  };

  const obtenerVarianteEstado = (estado) => {
    switch (normalizarEstado(estado)) {
      case "pendiente":
        return "default";
      case "cancelado":
        return "destructive";
      case "retirado":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const alternarExpandido = (pedidoId) => {
    setPedidosExpandidos((prev) =>
      prev.includes(pedidoId)
        ? prev.filter((id) => id !== pedidoId)
        : [...prev, pedidoId]
    );
  };

  const manejarReorden = (pedido) => {
    const nuevoPedido = {
      ...pedido,
      id: `pedido-${Date.now()}`,
      estado: "pendiente",
      fecha: "Hoy",
    };

    const pedidosActualizados = [nuevoPedido, ...pedidos];
    setPedidos(pedidosActualizados);
    const jsonPedidos = JSON.stringify(pedidosActualizados);
    localStorage.setItem("pedidos", jsonPedidos);
    ultimoValorRef.current = jsonPedidos;

    toast.success(
      `Pedido de ${obtenerNombreComercio(pedido)} agregado nuevamente`
    );
  };

  const pedidosFiltrados =
    filtroEstado === "en-curso"
      ? pedidos.filter(
        (pedido) => normalizarEstado(pedido.estado || pedido.status) === "pendiente"
      )
      : pedidos.filter(
        (pedido) => {
          const estado = normalizarEstado(pedido.estado || pedido.status);
          return estado === "retirado" || estado === "cancelado";
        }
      );

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
                key={pedido.id}
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
