import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { variantesAlternar } from "@/components/ui/alternar";

const ContextoGrupoAlternar = React.createContext({
  size: "default",
  variant: "default",
});

const GrupoAlternar = React.forwardRef(({ className, variant, size, children, ...props }, ref) => (<ToggleGroupPrimitive.Root ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
  <ContextoGrupoAlternar.Provider value={{ variant, size }}>{children}</ContextoGrupoAlternar.Provider>
</ToggleGroupPrimitive.Root>));
GrupoAlternar.displayName = "GrupoAlternar";

const ElementoGrupoAlternar = React.forwardRef(({ className, children, variant, size, ...props }, ref) => {
  const contexto = React.useContext(ContextoGrupoAlternar);
  return (<ToggleGroupPrimitive.Item ref={ref} className={cn(variantesAlternar({
    variant: contexto.variant || variant,
    size: contexto.size || size,
  }), className)} {...props}>
    {children}
  </ToggleGroupPrimitive.Item>);
});
ElementoGrupoAlternar.displayName = "ElementoGrupoAlternar";

export { GrupoAlternar, ElementoGrupoAlternar };
