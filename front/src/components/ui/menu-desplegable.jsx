import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const MenuDesplegable = DropdownMenuPrimitive.Root;

const DisparadorMenuDesplegable = DropdownMenuPrimitive.Trigger;

const GrupoMenuDesplegable = DropdownMenuPrimitive.Group;

const PortalMenuDesplegable = DropdownMenuPrimitive.Portal;

const SubMenuDesplegable = DropdownMenuPrimitive.Sub;

const GrupoRadioMenuDesplegable = DropdownMenuPrimitive.RadioGroup;

const DisparadorSubMenuDesplegable = React.forwardRef(({ className, inset, children, ...props }, ref) => (<DropdownMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent focus:bg-accent", inset && "pl-8", className)} {...props}>
  {children}
  <ChevronRight className="ml-auto h-4 w-4" />
</DropdownMenuPrimitive.SubTrigger>));
DisparadorSubMenuDesplegable.displayName = "DisparadorSubMenuDesplegable";

const ContenidoSubMenuDesplegable = React.forwardRef(({ className, ...props }, ref) => (<DropdownMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />));
ContenidoSubMenuDesplegable.displayName = "ContenidoSubMenuDesplegable";

const ContenidoMenuDesplegable = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (<DropdownMenuPrimitive.Portal>
  <DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
</DropdownMenuPrimitive.Portal>));
ContenidoMenuDesplegable.displayName = "ContenidoMenuDesplegable";

const ElementoMenuDesplegable = React.forwardRef(({ className, inset, ...props }, ref) => (<DropdownMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", inset && "pl-8", className)} {...props} />));
ElementoMenuDesplegable.displayName = "ElementoMenuDesplegable";

const ElementoCheckboxMenuDesplegable = React.forwardRef(({ className, children, checked, ...props }, ref) => (<DropdownMenuPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", className)} checked={checked} {...props}>
  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <DropdownMenuPrimitive.ItemIndicator>
      <Check className="h-4 w-4" />
    </DropdownMenuPrimitive.ItemIndicator>
  </span>
  {children}
</DropdownMenuPrimitive.CheckboxItem>));
ElementoCheckboxMenuDesplegable.displayName = "ElementoCheckboxMenuDesplegable";

const ElementoRadioMenuDesplegable = React.forwardRef(({ className, children, ...props }, ref) => (<DropdownMenuPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", className)} {...props}>
  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <DropdownMenuPrimitive.ItemIndicator>
      <Circle className="h-2 w-2 fill-current" />
    </DropdownMenuPrimitive.ItemIndicator>
  </span>
  {children}
</DropdownMenuPrimitive.RadioItem>));
ElementoRadioMenuDesplegable.displayName = "ElementoRadioMenuDesplegable";

const EtiquetaMenuDesplegable = React.forwardRef(({ className, inset, ...props }, ref) => (<DropdownMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />));
EtiquetaMenuDesplegable.displayName = "EtiquetaMenuDesplegable";

const SeparadorMenuDesplegable = React.forwardRef(({ className, ...props }, ref) => (<DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />));
SeparadorMenuDesplegable.displayName = "SeparadorMenuDesplegable";

const AtajoMenuDesplegable = ({ className, ...props }) => {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
};
AtajoMenuDesplegable.displayName = "AtajoMenuDesplegable";

export { MenuDesplegable, DisparadorMenuDesplegable, ContenidoMenuDesplegable, ElementoMenuDesplegable, ElementoCheckboxMenuDesplegable, ElementoRadioMenuDesplegable, EtiquetaMenuDesplegable, SeparadorMenuDesplegable, AtajoMenuDesplegable, GrupoMenuDesplegable, PortalMenuDesplegable, SubMenuDesplegable, ContenidoSubMenuDesplegable, DisparadorSubMenuDesplegable, GrupoRadioMenuDesplegable };
