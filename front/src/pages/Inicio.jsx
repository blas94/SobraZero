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
import { Entrada } from "@/components/ui/Entrada";
import { Boton } from "@/components/ui/Boton";
import { Insignia } from "@/components/ui/Insignia";
import {
  Hoja,
  ContenidoHoja,
  EncabezadoHoja,
  TituloHoja,
} from "@/components/ui/Hoja";
import {
  Cajon,
  ContenidoCajon,
  EncabezadoCajon,
  TituloCajon,
} from "@/components/ui/Cajon";
import { Tarjeta } from "@/components/ui/Tarjeta";
import FiltrosComercio from "@/components/FiltrosComercio";
import ContenidoComercio from "@/components/ContenidoComercio";
import NavegacionInferior from "@/components/NavegacionInferior";
import {
  comercios as comerciosMock,
  resenasPorComercio,
} from "@/data/datos-comercios";
import { categorias } from "@/data/categorias-comercios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createRoot } from "react-dom/client";
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

  const [ubicacionUsuario, setUbicacionUsuario] = useState(() => {
    return localStorage.getItem("ultimaDireccion") || "Balvanera, CABA";
  });

  const [mapaCentro] = useState(() => {
    const coordsGuardadas = localStorage.getItem("ultimasCoordenadas");
    return coordsGuardadas
      ? JSON.parse(coordsGuardadas)
      : [-58.3960002, -34.6043469];
  });

  // Referencia para guardar la ubicación sin causar re-renders
  const ultimaUbicacionRef = useRef(mapaCentro);

  const marcadoresRef = useRef([]);

  useEffect(() => {
    if (!contenedorMapa.current || mapaRef.current) return;

    mapboxgl.accessToken = tokenMapbox;

    mapaRef.current = new mapboxgl.Map({
      container: contenedorMapa.current,
      style: esModoOscuro
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: mapaCentro,
      zoom: 14,
    });

    mapaRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    mapaRef.current.addControl(geolocate, "top-right");

    // Obtener ubicación con el API nativa del navegador para asegurar control total
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Efecto visual: Volar a la ubicación del usuario
          if (mapaRef.current) {
            // Pequeño delay para que se note la transición
            setTimeout(() => {
              mapaRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 15,
                speed: 1.2,
                curve: 1.42,
                essential: true
              });
            }, 1000);
          }

          // Reverse Geocoding
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place,neighborhood&access_token=${tokenMapbox}`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
              const lugar = data.features.find((f) =>
                f.place_type.includes("neighborhood")
              );
              const ciudad = data.features.find((f) =>
                f.place_type.includes("place")
              );

              const nombreLugar = lugar ? lugar.text : "";
              const nombreCiudad = ciudad ? ciudad.text : "";

              let nuevaUbicacion = "";
              if (nombreLugar && nombreCiudad) {
                nuevaUbicacion = `${nombreLugar}, ${nombreCiudad}`;
              } else if (nombreCiudad) {
                nuevaUbicacion = nombreCiudad;
              }

              if (nuevaUbicacion) {
                setUbicacionUsuario(nuevaUbicacion);
                localStorage.setItem("ultimaDireccion", nuevaUbicacion);
              }
            }
          } catch (error) {
            console.error("Error obteniendo ubicación:", error);
          }
        },
        (error) => {
          console.error("Error nativo de geolocalización:", error);
        },
        { enableHighAccuracy: true }
      );
    }

    // Activar el control visual de Mapbox en cuanto cargue
    mapaRef.current.on('load', () => {
      geolocate.trigger();
      const event = new CustomEvent("mapLoaded");
      window.dispatchEvent(event);
    });

    // Guardar la última posición del mapa cuando el usuario deja de moverlo
    mapaRef.current.on("moveend", () => {
      if (mapaRef.current) {
        const center = mapaRef.current.getCenter();
        const centerArray = [center.lng, center.lat];
        ultimaUbicacionRef.current = centerArray;
        localStorage.setItem("ultimasCoordenadas", JSON.stringify(centerArray));
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

  // Efecto para ajustar el mapa a los comercios filtrados
  useEffect(() => {
    if (
      !mapaRef.current ||
      !mapaRef.current.loaded() ||
      comerciosMapaFiltrados.length === 0
    )
      return;

    // Si hay una búsqueda activa (texto o categoría que no sea 'all'), ajustamos el mapa
    if (busquedaMapa || categoriaSeleccionada !== "all") {
      const bounds = new mapboxgl.LngLatBounds();

      comerciosMapaFiltrados.forEach((comercio) => {
        bounds.extend([comercio.longitud, comercio.latitud]);
      });

      mapaRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000,
      });
    }
  }, [comerciosMapaFiltrados, busquedaMapa, categoriaSeleccionada]);

  useEffect(() => {
    // Función para limpiar todos los marcadores actuales
    const clearMarkers = () => {
      marcadoresRef.current.forEach((marker) => marker.remove());
      marcadoresRef.current = [];
    };

    const updateMarkers = () => {
      if (!mapaRef.current) return;

      clearMarkers();

      comerciosMapaFiltrados.forEach((comercio) => {
        if (mapaRef.current) {
          // Find category data to get the icon
          const categoriaData = categorias.find(c => c.id === comercio.categoria) || categorias[0];
          const Icono = categoriaData.icon;

          // Create marker DOM element
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.backgroundColor = '#407b41';
          el.style.width = '32px';
          el.style.height = '32px';
          el.style.borderRadius = '50%';
          el.style.display = 'flex';
          el.style.justifyContent = 'center';
          el.style.alignItems = 'center';
          el.style.color = 'white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          // Render icon into the element
          const root = createRoot(el);
          root.render(<Icono size={18} />);

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([comercio.longitud, comercio.latitud])
            .addTo(mapaRef.current);

          marker.getElement().addEventListener("click", () => {
            setComercioSeleccionado(comercio.id);
          });

          marcadoresRef.current.push(marker);
        }
      });
    };

    // Asegurarse de limpiar antes de actualizar
    updateMarkers();

    window.addEventListener("mapLoaded", updateMarkers);

    return () => {
      window.removeEventListener("mapLoaded", updateMarkers);
      clearMarkers(); // Limpiar al desmontar efecto
    };
  }, [navegar, comerciosMapaFiltrados, esModoOscuro]);

  // Actualizar estilo del mapa cuando cambie el modo oscuro
  useEffect(() => {
    if (mapaRef.current) {
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
        /* Ocultar el círculo de precisión (celeste grande) */
        .mapboxgl-user-location-accuracy-circle {
          display: none !important;
        }
        /* Cambiar color del punto central a verde SobraZero */
        .mapboxgl-user-location-dot {
          background-color: #407b41 !important;
        }
        /* Cambiar el color del halo pulsante */
        .mapboxgl-user-location-dot::before {
          background-color: #407b41 !important;
        }
        /* Icono de flecha de dirección (cuando hay heading) */
        .mapboxgl-user-location-show-heading .mapboxgl-user-location-heading:before {
          border-bottom-color: #407b41 !important;
        }
        .mapboxgl-user-location-show-heading .mapboxgl-user-location-heading:after {
          border-bottom-color: #407b41 !important;
        }
        /* Cambiar color del icono del botón de geolocalización usando filtros CSS para mantener la forma original */
        .mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon {
          filter: invert(38%) sepia(61%) saturate(464%) hue-rotate(86deg) brightness(80%) contrast(90%) !important;
        }
        .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-active .mapboxgl-ctrl-icon {
          filter: invert(38%) sepia(61%) saturate(464%) hue-rotate(86deg) brightness(80%) contrast(90%) !important;
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
        <span className="font-medium">{ubicacionUsuario}</span>
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
            )
            }
          </div >
        </ContenidoHoja >
      </Hoja >
    </div >
  );
};

export default Inicio;
