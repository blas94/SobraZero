import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Bell,
  Package,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { Entrada } from "@/components/ui/entrada";
import { Boton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/insignia";
import {
  Hoja,
  ContenidoHoja,
  EncabezadoHoja,
  TituloHoja,
} from "@/components/ui/hoja";
import {
  Cajon,
  ContenidoCajon,
  EncabezadoCajon,
  TituloCajon,
} from "@/components/ui/cajon";
import { Tarjeta } from "@/components/ui/tarjeta";
import FiltrosComercio from "@/components/FiltrosComercio";
import ContenidoComercio from "@/components/ContenidoComercio";
import NavegacionInferior from "@/components/NavegacionInferior";
import {
  comercios as comerciosMock,
  resenasPorComercio,
} from "@/data/datos-comercios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { usarTema } from "@/hooks/usar-tema";

const Inicio = () => {
  const navegar = useNavigate();
  const { esModoOscuro } = usarTema();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [busquedaMapa, setBusquedaMapa] = useState("");
  const contenedorMapa = useRef(null);
  const mapaRef = useRef(null);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [comercioSeleccionado, setComercioSeleccionado] = useState(null);
  const [tokenMapbox] = useState(
    "pk.eyJ1IjoidG9tYXNtaXNyYWhpIiwiYSI6ImNtaDJwZDkwaDJ1eW0yd3B5eDZ6b3Y1djMifQ.44qXpnbdv09ro4NME7QxJQ"
  );
  const [comerciosLocales, setComerciosLocales] = useState(comerciosMock);
  const [notificaciones, setNotificaciones] = useState([
    {
      id: "1",
      type: "order",
      title: "Pedido confirmado",
      description: "Tu pedido de Panadería Don Juan está listo para retirar",
      time: "Hace 10 min",
      icon: CheckCircle2,
      unread: true,
    },
    {
      id: "2",
      type: "promo",
      title: "Nueva oferta cerca",
      description: "Verdulería Los Andes tiene 60% de descuento",
      time: "Hace 1 hora",
      icon: Package,
      unread: true,
    },
    {
      id: "3",
      type: "reminder",
      title: "Recordatorio de retiro",
      description: "No olvides retirar tu pedido antes de las 20:00",
      time: "Hace 2 horas",
      icon: Clock,
      unread: true,
    },
    {
      id: "4",
      type: "order",
      title: "Pedido completado",
      description: "¡Gracias por usar SobraZero!",
      time: "Ayer",
      icon: CheckCircle2,
      unread: false,
    },
  ]);

  const notificacionesSinLeer = notificaciones.filter((n) => n.unread).length;

  const manejarEliminarNotificacion = (notificationId) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const manejarEliminarTodasNotificaciones = () => {
    setNotificaciones([]);
  };

  const normalizarTexto = (texto = "") => {
    return texto
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const comerciosFiltrados = comerciosLocales.filter((comercio) => {
    const coincideCategoria =
      categoriaSeleccionada === "all" ||
      comercio.categoria === categoriaSeleccionada;

    const busquedaNormalizada = normalizarTexto(busquedaMapa);
    const nombreNormalizado = normalizarTexto(comercio.nombre);
    const palabrasBusqueda = busquedaNormalizada
      .split(" ")
      .filter((palabra) => palabra.length > 0);
    const coincideBusqueda =
      palabrasBusqueda.length === 0 ||
      palabrasBusqueda.some((palabra) => nombreNormalizado.includes(palabra));

    return coincideCategoria && coincideBusqueda;
  });

  const comerciosMapaFiltrados = comerciosLocales.filter((comercio) => {
    const coincideCategoria =
      categoriaSeleccionada === "all" ||
      comercio.categoria === categoriaSeleccionada;

    const busquedaNormalizada = normalizarTexto(busquedaMapa);
    const nombreNormalizado = normalizarTexto(comercio.nombre);
    const palabrasBusqueda = busquedaNormalizada
      .split(" ")
      .filter((palabra) => palabra.length > 0);
    const coincideBusqueda =
      palabrasBusqueda.length === 0 ||
      palabrasBusqueda.some((palabra) => nombreNormalizado.includes(palabra));

    return coincideCategoria && coincideBusqueda;
  });

  const marcadoresRef = useRef([]);

  useEffect(() => {
    if (!contenedorMapa.current || mapaRef.current) return;

    mapboxgl.accessToken = tokenMapbox;

    mapaRef.current = new mapboxgl.Map({
      container: contenedorMapa.current,
      style: esModoOscuro
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: [-58.3960002, -34.6043469],
      zoom: 14,
    });

    mapaRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapaRef.current.on("load", () => {
      if (mapaRef.current) {
        const event = new CustomEvent("mapLoaded");
        window.dispatchEvent(event);
      }
    });

    return () => {
      marcadoresRef.current.forEach((marker) => marker.remove());
      marcadoresRef.current = [];
      if (mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current = null;
      }
    };
  }, [tokenMapbox]);

  useEffect(() => {
    const updateMarkers = () => {
      if (!mapaRef.current || !mapaRef.current.loaded()) return;

      marcadoresRef.current.forEach((marker) => marker.remove());
      marcadoresRef.current = [];

      comerciosMapaFiltrados.forEach((comercio) => {
        if (mapaRef.current) {
          const marker = new mapboxgl.Marker({ color: "#407b41" })
            .setLngLat([comercio.longitud, comercio.latitud])
            .addTo(mapaRef.current);

          marker.getElement().addEventListener("click", () => {
            setComercioSeleccionado(comercio.id);
          });

          marcadoresRef.current.push(marker);
        }
      });
    };

    updateMarkers();

    window.addEventListener("mapLoaded", updateMarkers);

    return () => {
      window.removeEventListener("mapLoaded", updateMarkers);
    };
  }, [navegar, comerciosMapaFiltrados, esModoOscuro]);

  // Actualizar estilo del mapa cuando cambie el modo oscuro
  useEffect(() => {
    if (mapaRef.current && mapaRef.current.loaded()) {
      mapaRef.current.setStyle(
        esModoOscuro
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11"
      );
    }
  }, [esModoOscuro]);

  useEffect(() => {
    if (mostrarNotificaciones) {
      window.history.pushState({ notificacionesOpen: true }, "");

      const handlePopState = (event) => {
        setMostrarNotificaciones(false);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [mostrarNotificaciones]);

  useEffect(() => {
    const manejarReservaComercio = (evento) => {
      const { idComercio, nuevoDisponible } = evento.detail;
      setComerciosLocales((previos) =>
        previos.map((comercio) =>
          comercio.id === idComercio
            ? { ...comercio, disponibles: nuevoDisponible }
            : comercio
        )
      );
    };

    window.addEventListener("comercioReservado", manejarReservaComercio);
    return () =>
      window.removeEventListener("comercioReservado", manejarReservaComercio);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        ref={contenedorMapa}
        className="absolute inset-0 w-full h-full mapbox-container"
      />
      <style>{`
        .mapboxgl-ctrl-top-right {
          top: 160px !important;
        }
      `}</style>

      <h1 className="sr-only">Buscador de Comercios</h1>

      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Entrada
            placeholder="Buscar comercios..."
            value={busquedaTexto}
            onChange={(e) => setBusquedaTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setBusquedaMapa(busquedaTexto);
                e.currentTarget.blur();
              }
            }}
            className="pl-10 pr-10 bg-white dark:bg-card shadow-lg"
          />
          {busquedaTexto && (
            <Boton
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => {
                setBusquedaTexto("");
                setBusquedaMapa("");
              }}
            >
              <X className="w-4 h-4" />
            </Boton>
          )}
        </div>
        <Boton
          variant="ghost"
          size="icon"
          className="relative flex-shrink-0 bg-white dark:bg-card shadow-lg"
          onClick={() => setMostrarNotificaciones(true)}
        >
          <Bell className="w-5 h-5" />
          {notificacionesSinLeer > 0 && (
            <Insignia
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {notificacionesSinLeer}
            </Insignia>
          )}
        </Boton>
      </div>

      <div className="absolute top-16 left-4 right-4 z-10">
        <FiltrosComercio
          categoriaSeleccionada={categoriaSeleccionada}
          alCambiarCategoria={(categoria) => {
            setCategoriaSeleccionada(categoria);
            setBusquedaTexto("");
            setBusquedaMapa("");
          }}
        />
      </div>

      <div className="absolute top-28 left-4 z-10 bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg inline-flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="font-medium">Balvanera, CABA</span>
      </div>


      <NavegacionInferior />

      <Cajon
        open={!!comercioSeleccionado}
        onOpenChange={(open) => !open && setComercioSeleccionado(null)}
        snapPoints={[0.45, 0.95]}
        fadeFromIndex={1}
      >
        <ContenidoCajon className="max-h-[96vh]">
          <EncabezadoCajon>
            <TituloCajon className="sr-only">
              {
                comerciosLocales.find(
                  (comercio) => comercio.id === comercioSeleccionado
                )?.nombre
              }
            </TituloCajon>
          </EncabezadoCajon>
          <div className="overflow-y-auto pb-6">
            {comercioSeleccionado && (
              <ContenidoComercio
                idComercio={comercioSeleccionado}
                comercios={comerciosLocales}
                resenasGlobales={resenasPorComercio}
                mostrarBotonVolver={false}
              />
            )}
          </div>
        </ContenidoCajon>
      </Cajon>

      <Hoja
        open={mostrarNotificaciones}
        onOpenChange={setMostrarNotificaciones}
      >
        <ContenidoHoja
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <EncabezadoHoja>
            <TituloHoja>Notificaciones</TituloHoja>
          </EncabezadoHoja>

          <div className="mt-6 space-y-3 pb-6">
            {notificaciones.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No hay notificaciones</p>
              </div>
            ) : (
              <>
                {notificaciones.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <Tarjeta
                      key={notification.id}
                      className={`p-4 transition-colors relative ${notification.unread
                        ? "bg-primary/5 border-primary/20"
                        : ""
                        }`}
                    >
                      <Boton
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() =>
                          manejarEliminarNotificacion(notification.id)
                        }
                      >
                        <X className="w-5 h-5" />
                      </Boton>
                      <div className="flex gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.unread ? "bg-primary/10" : "bg-muted"
                            }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${notification.unread
                              ? "text-primary"
                              : "text-muted-foreground"
                              }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <h3 className="font-semibold text-sm mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </Tarjeta>
                  );
                })}
                <Boton
                  variant="outline"
                  className="w-full mt-4"
                  onClick={manejarEliminarTodasNotificaciones}
                >
                  Eliminar todas las notificaciones
                </Boton>
              </>
            )}
          </div>
        </ContenidoHoja>
      </Hoja>
    </div >
  );
};

export default Inicio;
