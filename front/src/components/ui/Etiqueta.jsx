import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variantesEtiqueta = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Etiqueta = React.forwardRef(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(variantesEtiqueta(), className)}
        {...props}
    />
));
Etiqueta.displayName = LabelPrimitive.Root.displayName;

export { Etiqueta };
