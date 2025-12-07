import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

const Cajon = ({ shouldScaleBackground = true, ...props }) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Cajon.displayName = "Cajon";

const DisparadorCajon = DrawerPrimitive.Trigger;
const PortalCajon = DrawerPrimitive.Portal;
const CerrarCajon = DrawerPrimitive.Close;

const SuperposicionCajon = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
));
SuperposicionCajon.displayName = DrawerPrimitive.Overlay.displayName;

const ContenidoCajon = React.forwardRef(({ className, children, ...props }, ref) => (
  <PortalCajon>
    <SuperposicionCajon />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </PortalCajon>
));
ContenidoCajon.displayName = "ContenidoCajon";

const EncabezadoCajon = ({ className, ...props }) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
);
EncabezadoCajon.displayName = "EncabezadoCajon";

const PieCajon = ({ className, ...props }) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);
PieCajon.displayName = "PieCajon";

const TituloCajon = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
));
TituloCajon.displayName = DrawerPrimitive.Title.displayName;

const DescripcionCajon = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DescripcionCajon.displayName = DrawerPrimitive.Description.displayName;

export {
  Cajon,
  PortalCajon,
  SuperposicionCajon,
  DisparadorCajon,
  CerrarCajon,
  ContenidoCajon,
  EncabezadoCajon,
  PieCajon,
  TituloCajon,
  DescripcionCajon,
};
