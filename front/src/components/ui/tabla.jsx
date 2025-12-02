import * as React from "react";
import { cn } from "@/lib/utils";

const Tabla = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));
Tabla.displayName = "Tabla";

const EncabezadoTabla = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
EncabezadoTabla.displayName = "EncabezadoTabla";

const CuerpoTabla = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
CuerpoTabla.displayName = "CuerpoTabla";

const PieTabla = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
));
PieTabla.displayName = "PieTabla";

const FilaTabla = React.forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50", className)} {...props} />
));
FilaTabla.displayName = "FilaTabla";

const EncabezadoCeldaTabla = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
EncabezadoCeldaTabla.displayName = "EncabezadoCeldaTabla";

const CeldaTabla = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
));
CeldaTabla.displayName = "CeldaTabla";

const LeyendaTabla = React.forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
LeyendaTabla.displayName = "LeyendaTabla";

export { Tabla, EncabezadoTabla, CuerpoTabla, PieTabla, EncabezadoCeldaTabla, FilaTabla, CeldaTabla, LeyendaTabla };
