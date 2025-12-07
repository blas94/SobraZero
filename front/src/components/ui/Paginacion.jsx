import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { variantesBoton } from "@/components/ui/Boton";

const Paginacion = ({ className, ...props }) => (
  <nav role="navigation" aria-label="paginación" className={cn("mx-auto flex w-full justify-center", className)} {...props} />
);
Paginacion.displayName = "Paginacion";

const ContenidoPaginacion = React.forwardRef(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
));
ContenidoPaginacion.displayName = "ContenidoPaginacion";

const ElementoPaginacion = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
ElementoPaginacion.displayName = "ElementoPaginacion";

const EnlacePaginacion = ({ className, isActive, size = "icon", ...props }) => (
  <a aria-current={isActive ? "page" : undefined} className={cn(variantesBoton({
    variant: isActive ? "outline" : "ghost",
    size,
  }), className)} {...props} />
);
EnlacePaginacion.displayName = "EnlacePaginacion";

const PaginacionAnterior = ({ className, ...props }) => (
  <EnlacePaginacion aria-label="Ir a la página anterior" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Anterior</span>
  </EnlacePaginacion>
);
PaginacionAnterior.displayName = "PaginacionAnterior";

const PaginacionSiguiente = ({ className, ...props }) => (
  <EnlacePaginacion aria-label="Ir a la página siguiente" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
    <span>Siguiente</span>
    <ChevronRight className="h-4 w-4" />
  </EnlacePaginacion>
);
PaginacionSiguiente.displayName = "PaginacionSiguiente";

const ElipsisPaginacion = ({ className, ...props }) => (
  <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Más páginas</span>
  </span>
);
ElipsisPaginacion.displayName = "ElipsisPaginacion";

export { Paginacion, ContenidoPaginacion, ElipsisPaginacion, ElementoPaginacion, EnlacePaginacion, PaginacionSiguiente, PaginacionAnterior };
