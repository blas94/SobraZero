import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { variantesBoton } from "@/components/ui/Boton";

const DialogoAlerta = AlertDialogPrimitive.Root;

const ActivadorDialogoAlerta = AlertDialogPrimitive.Trigger;

const PortalDialogoAlerta = AlertDialogPrimitive.Portal;

const SuperposicionDialogoAlerta = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
SuperposicionDialogoAlerta.displayName = AlertDialogPrimitive.Overlay.displayName;

const ContenidoDialogoAlerta = React.forwardRef(({ className, ...props }, ref) => (
  <PortalDialogoAlerta>
    <SuperposicionDialogoAlerta />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </PortalDialogoAlerta>
));
ContenidoDialogoAlerta.displayName = AlertDialogPrimitive.Content.displayName;

const EncabezadoDialogoAlerta = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
EncabezadoDialogoAlerta.displayName = "EncabezadoDialogoAlerta";

const PieDialogoAlerta = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
PieDialogoAlerta.displayName = "PieDialogoAlerta";

const TituloDialogoAlerta = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
TituloDialogoAlerta.displayName = AlertDialogPrimitive.Title.displayName;

const DescripcionDialogoAlerta = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DescripcionDialogoAlerta.displayName =
  AlertDialogPrimitive.Description.displayName;

const AccionDialogoAlerta = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(variantesBoton(), className)}
    {...props}
  />
));
AccionDialogoAlerta.displayName = AlertDialogPrimitive.Action.displayName;

const CancelarDialogoAlerta = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      variantesBoton({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
));
CancelarDialogoAlerta.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  DialogoAlerta,
  PortalDialogoAlerta,
  SuperposicionDialogoAlerta,
  ActivadorDialogoAlerta,
  ContenidoDialogoAlerta,
  EncabezadoDialogoAlerta,
  PieDialogoAlerta,
  TituloDialogoAlerta,
  DescripcionDialogoAlerta,
  AccionDialogoAlerta,
  CancelarDialogoAlerta,
};
