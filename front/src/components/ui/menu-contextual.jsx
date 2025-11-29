import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const MenuContextual = ContextMenuPrimitive.Root;

const DisparadorMenuContextual = ContextMenuPrimitive.Trigger;

const GrupoMenuContextual = ContextMenuPrimitive.Group;

const PortalMenuContextual = ContextMenuPrimitive.Portal;

const SubMenuContextual = ContextMenuPrimitive.Sub;

const GrupoRadioMenuContextual = ContextMenuPrimitive.RadioGroup;

const DisparadorSubMenuContextual = React.forwardRef(({ className, inset, children, ...props }, ref) => (<ContextMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground", inset && "pl-8", className)} {...props}>
  {children}
  <ChevronRight className="ml-auto h-4 w-4" />
</ContextMenuPrimitive.SubTrigger>));
DisparadorSubMenuContextual.displayName = "DisparadorSubMenuContextual";

const ContenidoSubMenuContextual = React.forwardRef(({ className, ...props }, ref) => (<ContextMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />));
ContenidoSubMenuContextual.displayName = "ContenidoSubMenuContextual";

const ContenidoMenuContextual = React.forwardRef(({ className, ...props }, ref) => (<ContextMenuPrimitive.Portal>
  <ContextMenuPrimitive.Content ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
</ContextMenuPrimitive.Portal>));
ContenidoMenuContextual.displayName = "ContenidoMenuContextual";

const ElementoMenuContextual = React.forwardRef(({ className, inset, ...props }, ref) => (<ContextMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", inset && "pl-8", className)} {...props} />));
ElementoMenuContextual.displayName = "ElementoMenuContextual";

const ElementoCheckboxMenuContextual = React.forwardRef(({ className, children, checked, ...props }, ref) => (<ContextMenuPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", className)} checked={checked} {...props}>
  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <ContextMenuPrimitive.ItemIndicator>
      <Check className="h-4 w-4" />
    </ContextMenuPrimitive.ItemIndicator>
  </span>
  {children}
</ContextMenuPrimitive.CheckboxItem>));
ElementoCheckboxMenuContextual.displayName = "ElementoCheckboxMenuContextual";

const ElementoRadioMenuContextual = React.forwardRef(({ className, children, ...props }, ref) => (<ContextMenuPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", className)} {...props}>
  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <ContextMenuPrimitive.ItemIndicator>
      <Circle className="h-2 w-2 fill-current" />
    </ContextMenuPrimitive.ItemIndicator>
  </span>
  {children}
</ContextMenuPrimitive.RadioItem>));
ElementoRadioMenuContextual.displayName = "ElementoRadioMenuContextual";

const EtiquetaMenuContextual = React.forwardRef(({ className, inset, ...props }, ref) => (<ContextMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)} {...props} />));
EtiquetaMenuContextual.displayName = "EtiquetaMenuContextual";

const SeparadorMenuContextual = React.forwardRef(({ className, ...props }, ref) => (<ContextMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />));
SeparadorMenuContextual.displayName = "SeparadorMenuContextual";

const AtajoMenuContextual = ({ className, ...props }) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
AtajoMenuContextual.displayName = "AtajoMenuContextual";

export { MenuContextual, DisparadorMenuContextual, ContenidoMenuContextual, ElementoMenuContextual, ElementoCheckboxMenuContextual, ElementoRadioMenuContextual, EtiquetaMenuContextual, SeparadorMenuContextual, AtajoMenuContextual, GrupoMenuContextual, PortalMenuContextual, SubMenuContextual, ContenidoSubMenuContextual, DisparadorSubMenuContextual, GrupoRadioMenuContextual };
