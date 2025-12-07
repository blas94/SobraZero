import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boton } from "@/components/ui/Boton";

const ContextoCarrusel = React.createContext(null);

function usarCarrusel() {
    const contexto = React.useContext(ContextoCarrusel);
    if (!contexto) {
        throw new Error("usarCarrusel debe utilizarse dentro de un <Carrusel />");
    }
    return contexto;
}

const Carrusel = React.forwardRef(({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
    const [referenciaCarrusel, apiCarrusel] = useEmblaCarousel({
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
    }, plugins);
    const [puedeDesplazarseAtras, establecerPuedeDesplazarseAtras] = React.useState(false);
    const [puedeDesplazarseAdelante, establecerPuedeDesplazarseAdelante] = React.useState(false);
    const manejarSeleccion = React.useCallback((apiActual) => {
        if (!apiActual) {
            return;
        }
        establecerPuedeDesplazarseAtras(apiActual.canScrollPrev());
        establecerPuedeDesplazarseAdelante(apiActual.canScrollNext());
    }, []);
    const desplazarAtras = React.useCallback(() => {
        apiCarrusel?.scrollPrev();
    }, [apiCarrusel]);
    const desplazarAdelante = React.useCallback(() => {
        apiCarrusel?.scrollNext();
    }, [apiCarrusel]);
    const manejarTecla = React.useCallback((evento) => {
        if (evento.key === "ArrowLeft") {
            evento.preventDefault();
            desplazarAtras();
        }
        else if (evento.key === "ArrowRight") {
            evento.preventDefault();
            desplazarAdelante();
        }
    }, [desplazarAtras, desplazarAdelante]);
    React.useEffect(() => {
        if (!apiCarrusel || !setApi) {
            return;
        }
        setApi(apiCarrusel);
    }, [apiCarrusel, setApi]);
    React.useEffect(() => {
        if (!apiCarrusel) {
            return;
        }
        manejarSeleccion(apiCarrusel);
        apiCarrusel.on("reInit", manejarSeleccion);
        apiCarrusel.on("select", manejarSeleccion);
        return () => {
            apiCarrusel?.off("select", manejarSeleccion);
        };
    }, [apiCarrusel, manejarSeleccion]);
    return (<ContextoCarrusel.Provider value={{
        carouselRef: referenciaCarrusel,
        api: apiCarrusel,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev: desplazarAtras,
        scrollNext: desplazarAdelante,
        canScrollPrev: puedeDesplazarseAtras,
        canScrollNext: puedeDesplazarseAdelante,
    }}>
        <div ref={ref} onKeyDownCapture={manejarTecla} className={cn("relative", className)} role="region" aria-roledescription="carrusel" {...props}>
            {children}
        </div>
    </ContextoCarrusel.Provider>);
});
Carrusel.displayName = "Carrusel";

const ContenidoCarrusel = React.forwardRef(({ className, ...props }, ref) => {
    const { carouselRef, orientation } = usarCarrusel();
    return (<div ref={carouselRef} className="overflow-hidden">
        <div ref={ref} className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
    </div>);
});
ContenidoCarrusel.displayName = "ContenidoCarrusel";

const ElementoCarrusel = React.forwardRef(({ className, ...props }, ref) => {
    const { orientation } = usarCarrusel();
    return (<div ref={ref} role="group" aria-roledescription="diapositiva" className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)} {...props} />);
});
ElementoCarrusel.displayName = "ElementoCarrusel";

const CarruselAnterior = React.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = usarCarrusel();
    return (<Boton ref={ref} variant={variant} size={size} className={cn("absolute h-8 w-8 rounded-full", orientation === "horizontal"
        ? "-left-12 top-1/2 -translate-y-1/2"
        : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)} disabled={!canScrollPrev} onClick={scrollPrev} {...props}>
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Diapositiva anterior</span>
    </Boton>);
});
CarruselAnterior.displayName = "CarruselAnterior";

const CarruselSiguiente = React.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = usarCarrusel();
    return (<Boton ref={ref} variant={variant} size={size} className={cn("absolute h-8 w-8 rounded-full", orientation === "horizontal"
        ? "-right-12 top-1/2 -translate-y-1/2"
        : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)} disabled={!canScrollNext} onClick={scrollNext} {...props}>
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Diapositiva siguiente</span>
    </Boton>);
});
CarruselSiguiente.displayName = "CarruselSiguiente";

export { Carrusel, ContenidoCarrusel, ElementoCarrusel, CarruselAnterior, CarruselSiguiente, usarCarrusel };
