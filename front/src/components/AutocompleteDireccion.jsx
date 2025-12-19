import { useState, useEffect, useRef } from "react";
import { Entrada } from "@/components/ui/Entrada";
import { MapPin, Loader2 } from "lucide-react";

const AutocompleteDireccion = ({
    valor = "",
    alCambiar,
    alSeleccionarLugar,
    placeholder = "Ingresá una dirección",
    ariaLabel = "Dirección",
    error,
}) => {
    const [sugerencias, setSugerencias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
    const contenedorRef = useRef(null);
    const temporizadorRef = useRef(null);
    const seleccionandoRef = useRef(false); // Flag para evitar búsqueda al seleccionar
    const interactuadoRef = useRef(false); // Flag para detectar interacción real del usuario

    // Token de Mapbox (el mismo que se usa en Inicio.jsx)
    const tokenMapbox =
        "pk.eyJ1IjoidG9tYXNtaXNyYWhpIiwiYSI6ImNtaDJwZDkwaDJ1eW0yd3B5eDZ6b3Y1djMifQ.44qXpnbdv09ro4NME7QxJQ";

    // Bounding box de Capital Federal, Buenos Aires
    const bboxCABA = "-58.531,-34.705,-58.335,-34.526";

    useEffect(() => {
        const manejarClickFuera = (evento) => {
            if (
                contenedorRef.current &&
                !contenedorRef.current.contains(evento.target)
            ) {
                setMostrarSugerencias(false);
            }
        };

        document.addEventListener("mousedown", manejarClickFuera);
        return () => document.removeEventListener("mousedown", manejarClickFuera);
    }, []);

    useEffect(() => {
        // Limpiar temporizador anterior
        if (temporizadorRef.current) {
            clearTimeout(temporizadorRef.current);
        }

        // No buscar si se está seleccionando una opción
        if (seleccionandoRef.current) {
            seleccionandoRef.current = false;
            return;
        }

        // No buscar si el usuario no ha interactuado aún (evita búsqueda al montar)
        if (!interactuadoRef.current) {
            return;
        }

        // No buscar si el texto es muy corto
        if (!valor || valor.length < 3) {
            setSugerencias([]);
            setCargando(false);
            return;
        }

        // Debounce de 300ms
        setCargando(true);
        temporizadorRef.current = setTimeout(async () => {
            try {
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    valor
                )}.json?access_token=${tokenMapbox}&country=ar&bbox=${bboxCABA}&types=address&language=es&limit=5`;

                const respuesta = await fetch(url);
                const datos = await respuesta.json();

                if (datos.features) {
                    setSugerencias(datos.features);
                    setMostrarSugerencias(true);
                }
            } catch (error) {
                console.error("Error al buscar direcciones:", error);
                setSugerencias([]);
            } finally {
                setCargando(false);
            }
        }, 300);

        return () => {
            if (temporizadorRef.current) {
                clearTimeout(temporizadorRef.current);
            }
        };
    }, [valor, tokenMapbox]);

    // Función para limpiar la dirección eliminando código postal y país
    const limpiarDireccion = (direccionCompleta) => {
        // Eliminar todo desde "Buenos Aires" en adelante (incluye código postal y Argentina)
        // Ejemplo: "Av. Corrientes 1234, Balvanera, Buenos Aires, C1043, Argentina" 
        // -> "Av. Corrientes 1234, Balvanera"
        const partes = direccionCompleta.split(",");

        // Buscar el índice donde aparece "Buenos Aires" o "Ciudad Autónoma de Buenos Aires"
        const indiceBuenosAires = partes.findIndex(parte =>
            parte.trim().toLowerCase().includes("buenos aires") ||
            parte.trim().toLowerCase().includes("ciudad autónoma")
        );

        // Si encontramos "Buenos Aires", tomar solo las partes anteriores
        if (indiceBuenosAires !== -1) {
            return partes.slice(0, indiceBuenosAires).join(",").trim();
        }

        // Si no encontramos, devolver la dirección completa
        return direccionCompleta.trim();
    };

    // Función helper para verificar si una dirección tiene número de calle
    // (verifica solo en la parte limpia, sin código postal)
    const tieneNumeroCalle = (direccion) => {
        const direccionLimpia = limpiarDireccion(direccion);
        // Verificar que tenga al menos un número en la primera parte (calle y número)
        const primeraParteConNumero = /^[^,]*\d/.test(direccionLimpia);
        return primeraParteConNumero;
    };

    const manejarSeleccion = (sugerencia) => {
        const direccionCompleta = sugerencia.place_name;
        const direccionLimpia = limpiarDireccion(direccionCompleta);

        // Marcar que estamos seleccionando para evitar búsqueda automática
        seleccionandoRef.current = true;

        alCambiar(direccionLimpia);
        alSeleccionarLugar(direccionLimpia);
        setMostrarSugerencias(false);
        setSugerencias([]);
        setIndiceSeleccionado(-1);
    };

    const manejarTecla = (evento) => {
        if (!mostrarSugerencias || sugerencias.length === 0) return;

        switch (evento.key) {
            case "ArrowDown":
                evento.preventDefault();
                setIndiceSeleccionado((prev) =>
                    prev < sugerencias.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                evento.preventDefault();
                setIndiceSeleccionado((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                evento.preventDefault();
                if (indiceSeleccionado >= 0) {
                    manejarSeleccion(sugerencias[indiceSeleccionado]);
                }
                break;
            case "Escape":
                setMostrarSugerencias(false);
                setIndiceSeleccionado(-1);
                break;
            default:
                break;
        }
    };

    return (
        <div ref={contenedorRef} className="relative">
            <div className="relative">
                <Entrada
                    value={valor}
                    onChange={(e) => {
                        interactuadoRef.current = true; // Marcar que el usuario ha interactuado
                        alCambiar(e.target.value);
                    }}
                    onKeyDown={manejarTecla}
                    onFocus={() => {
                        // Solo mostrar sugerencias si hay texto y sugerencias disponibles
                        if (valor.length >= 3 && sugerencias.length > 0) {
                            setMostrarSugerencias(true);
                        }
                    }}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    className={`pr-10 ${error ? "border-destructive" : ""}`}
                />
                {cargando && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
            </div>

            {mostrarSugerencias && sugerencias.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {sugerencias.map((sugerencia, indice) => {
                        const sinNumero = !tieneNumeroCalle(sugerencia.place_name);
                        const direccionLimpia = limpiarDireccion(sugerencia.place_name);
                        return (
                            <button
                                key={sugerencia.id}
                                type="button"
                                onClick={() => manejarSeleccion(sugerencia)}
                                onMouseEnter={() => setIndiceSeleccionado(indice)}
                                className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-start gap-3 ${indice === indiceSeleccionado ? "bg-muted" : ""
                                    } ${indice !== sugerencias.length - 1 ? "border-b border-border" : ""}`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${sinNumero ? "text-amber-600 dark:text-amber-500" : ""}`}>
                                        {sugerencia.text}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {direccionLimpia}
                                    </p>
                                    {sinNumero && (
                                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                            Esta dirección no incluye número de calle
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {mostrarSugerencias && !cargando && valor.length >= 3 && sugerencias.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4">
                    <p className="text-sm text-muted-foreground text-center">
                        No se encontraron direcciones en Capital Federal
                    </p>
                </div>
            )}
        </div>
    );
};

export default AutocompleteDireccion;
