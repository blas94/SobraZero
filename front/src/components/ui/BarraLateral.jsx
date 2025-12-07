import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";
import { usarEsCelular } from "@/hooks/usar-celular";
import { cn } from "@/lib/utils";
import { Boton } from "@/components/ui/Boton";
import { Entrada } from "@/components/ui/Entrada";
import { Separador } from "@/components/ui/Separador";
import { Hoja, ContenidoHoja } from "@/components/ui/Hoja";
import { Skeleton } from "@/components/ui/Esqueleto";
import {
    GloboInformacion,
    ContenidoGloboInformacion,
    ProveedorGloboInformacion,
    DisparadorGloboInformacion,
} from "@/components/ui/GloboInformacion";

const NOMBRE_COOKIE_BARRA = "sidebar:state";
const EDAD_MAX_COOKIE_BARRA = 60 * 60 * 24 * 7;
const ANCHO_BARRA = "16rem";
const ANCHO_BARRA_MOVIL = "18rem";
const ANCHO_ICONO_BARRA = "3rem";
const ATAJO_TECLADO_BARRA = "b";

const ContextoBarraLateral = React.createContext(null);

function usarBarraLateral() {
    const context = React.useContext(ContextoBarraLateral);
    if (!context) {
        throw new Error("usarBarraLateral debe usarse dentro de SidebarProvider.");
    }
    return context;
}

const ProveedorBarraLateral = React.forwardRef(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
    const esMovil = usarEsCelular();
    const [abiertaMovil, setAbiertaMovil] = React.useState(false);

    // Estado interno de la barra lateral.
    // Usamos openProp y setOpenProp para permitir control desde fuera del componente.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const estadoAbierta = openProp ?? _open;

    const setOpen = React.useCallback((value) => {
        const openState = typeof value === "function" ? value(estadoAbierta) : value;
        if (setOpenProp) {
            setOpenProp(openState);
        }
        else {
            _setOpen(openState);
        }
        // Esto establece la cookie para recordar el estado de la barra lateral.
        document.cookie = `${NOMBRE_COOKIE_BARRA}=${openState}; path=/; max-age=${EDAD_MAX_COOKIE_BARRA}`;
    }, [setOpenProp, estadoAbierta]);

    // Ayudante para alternar la barra lateral.
    const toggleSidebar = React.useCallback(() => {
        return esMovil ? setAbiertaMovil((open) => !open) : setOpen((open) => !open);
    }, [esMovil, setOpen, setAbiertaMovil]);

    // Añade un atajo de teclado para alternar la barra lateral.
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === ATAJO_TECLADO_BARRA && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    // Añadimos un estado para usar data-state="expanded" o "collapsed".
    // Esto facilita estilizar la barra lateral con clases de Tailwind.
    const state = estadoAbierta ? "expanded" : "collapsed";

    const contextValue = React.useMemo(() => ({
        state,
        open: estadoAbierta,
        setOpen,
        isMobile: esMovil,
        openMobile: abiertaMovil,
        setOpenMobile: setAbiertaMovil,
        toggleSidebar,
    }), [state, estadoAbierta, setOpen, esMovil, abiertaMovil, setAbiertaMovil, toggleSidebar]);

    return (<ContextoBarraLateral.Provider value={contextValue}>
        <ProveedorGloboInformacion delayDuration={0}>
            <div style={{
                "--sidebar-width": ANCHO_BARRA,
                "--sidebar-width-icon": ANCHO_ICONO_BARRA,
                ...style,
            }} className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)} ref={ref} {...props}>
                {children}
            </div>
        </ProveedorGloboInformacion>
    </ContextoBarraLateral.Provider>);
});
ProveedorBarraLateral.displayName = "ProveedorBarraLateral";

const BarraLateral = React.forwardRef(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = usarBarraLateral();
    if (collapsible === "none") {
        return (<div className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)} ref={ref} {...props}>
            {children}
        </div>);
    }
    if (isMobile) {
        return (<Hoja open={openMobile} onOpenChange={setOpenMobile} {...props}>
            <ContenidoHoja data-sidebar="sidebar" data-mobile="true" className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" style={{
                "--sidebar-width": ANCHO_BARRA_MOVIL,
            }} side={side}>
                <div className="flex h-full w-full flex-col">{children}</div>
            </ContenidoHoja>
        </Hoja>);
    }
    return (<div ref={ref} className="group peer hidden text-sidebar-foreground md:block" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side}>
        {/* Esto maneja el espacio de la barra lateral en escritorio */}
        <div className={cn("relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]")} />
        <div className={cn("fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex", side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
                ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
                : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l", className)} {...props}>
            <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
                {children}
            </div>
        </div>
    </div>);
});
BarraLateral.displayName = "BarraLateral";

const DisparadorBarraLateral = React.forwardRef(({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = usarBarraLateral();
    return (<Boton ref={ref} data-sidebar="trigger" variant="ghost" size="icon" className={cn("h-7 w-7", className)} onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
    }} {...props}>
        <PanelLeft />
        <span className="sr-only">Alternar barra lateral</span>
    </Boton>);
});
DisparadorBarraLateral.displayName = "DisparadorBarraLateral";

const RielBarraLateral = React.forwardRef(({ className, ...props }, ref) => {
    const { toggleSidebar } = usarBarraLateral();
    return (<button ref={ref} data-sidebar="rail" aria-label="Alternar barra lateral" tabIndex={-1} onClick={toggleSidebar} title="Alternar barra lateral" className={cn("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 hover:after:bg-sidebar-border sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className)} {...props} />);
});
RielBarraLateral.displayName = "RielBarraLateral";

const InsetBarraLateral = React.forwardRef(({ className, ...props }, ref) => {
    return (<main ref={ref} className={cn("relative flex min-h-svh flex-1 flex-col bg-background", "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className)} {...props} />);
});
InsetBarraLateral.displayName = "InsetBarraLateral";

const EntradaBarraLateral = React.forwardRef(({ className, ...props }, ref) => {
    return (<Entrada ref={ref} data-sidebar="input" className={cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className)} {...props} />);
});
EntradaBarraLateral.displayName = "EntradaBarraLateral";

const EncabezadoBarraLateral = React.forwardRef(({ className, ...props }, ref) => {
    return <div ref={ref} data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
EncabezadoBarraLateral.displayName = "EncabezadoBarraLateral";

const PieBarraLateral = React.forwardRef(({ className, ...props }, ref) => {
    return <div ref={ref} data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
PieBarraLateral.displayName = "PieBarraLateral";

const SeparadorBarraLateral = React.forwardRef(({ className, ...props }, ref) => {
    return (<Separador ref={ref} data-sidebar="separator" className={cn("mx-2 w-auto bg-sidebar-border", className)} {...props} />);
});
SeparadorBarraLateral.displayName = "SeparadorBarraLateral";

const ContenidoBarraLateral = React.forwardRef(({ className, ...props }, ref) => {
    return (<div ref={ref} data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props} />);
});
ContenidoBarraLateral.displayName = "ContenidoBarraLateral";

const GrupoBarraLateral = React.forwardRef(({ className, ...props }, ref) => {
    return (<div ref={ref} data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />);
});
GrupoBarraLateral.displayName = "GrupoBarraLateral";

const EtiquetaGrupoBarraLateral = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (<Comp ref={ref} data-sidebar="group-label" className={cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className)} {...props} />);
});
EtiquetaGrupoBarraLateral.displayName = "EtiquetaGrupoBarraLateral";

const AccionGrupoBarraLateral = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (<Comp ref={ref} data-sidebar="group-action" className={cn("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className)} {...props} />);
});
AccionGrupoBarraLateral.displayName = "AccionGrupoBarraLateral";

const ContenidoGrupoBarraLateral = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />));
ContenidoGrupoBarraLateral.displayName = "ContenidoGrupoBarraLateral";

const MenuBarraLateral = React.forwardRef(({ className, ...props }, ref) => (<ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />));
MenuBarraLateral.displayName = "MenuBarraLateral";

const ElementoMenuBarraLateral = React.forwardRef(({ className, ...props }, ref) => (<li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />));
ElementoMenuBarraLateral.displayName = "ElementoMenuBarraLateral";

const sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
    variants: {
        variant: {
            default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
        },
        size: {
            default: "h-8 text-sm",
            sm: "h-7 text-xs",
            lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

const BotonMenuBarraLateral = React.forwardRef(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = usarBarraLateral();
    const button = (<Comp ref={ref} data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({ variant, size }), className)} {...props} />);
    if (!tooltip) {
        return button;
    }
    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        };
    }
    return (<GloboInformacion>
        <DisparadorGloboInformacion asChild>{button}</DisparadorGloboInformacion>
        <ContenidoGloboInformacion side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip} />
    </GloboInformacion>);
});
BotonMenuBarraLateral.displayName = "BotonMenuBarraLateral";

const AccionMenuBarraLateral = React.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (<Comp ref={ref} data-sidebar="menu-action" className={cn("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover &&
    "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className)} {...props} />);
});
AccionMenuBarraLateral.displayName = "AccionMenuBarraLateral";

const InsigniaMenuBarraLateral = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} data-sidebar="menu-badge" className={cn("pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className)} {...props} />));
InsigniaMenuBarraLateral.displayName = "InsigniaMenuBarraLateral";

const EsqueletoMenuBarraLateral = React.forwardRef(({ className, showIcon = false, ...props }, ref) => {
    // Ancho aleatorio entre 50% y 90%.
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);
    return (<div ref={ref} data-sidebar="menu-skeleton" className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)} {...props}>
        {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
        <Skeleton className="h-4 max-w-[--skeleton-width] flex-1" data-sidebar="menu-skeleton-text" style={{
            "--skeleton-width": width,
        }} />
    </div>);
});
EsqueletoMenuBarraLateral.displayName = "EsqueletoMenuBarraLateral";

const SubMenuBarraLateral = React.forwardRef(({ className, ...props }, ref) => (<ul ref={ref} data-sidebar="menu-sub" className={cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className)} {...props} />));
SubMenuBarraLateral.displayName = "SubMenuBarraLateral";

const ElementoSubMenuBarraLateral = React.forwardRef(({ ...props }, ref) => (<li ref={ref} {...props} />));
ElementoSubMenuBarraLateral.displayName = "ElementoSubMenuBarraLateral";

const BotonSubMenuBarraLateral = React.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (<Comp ref={ref} data-sidebar="menu-sub-button" data-size={size} data-active={isActive} className={cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className)} {...props} />);
});
BotonSubMenuBarraLateral.displayName = "BotonSubMenuBarraLateral";

export { BarraLateral, ContenidoBarraLateral, PieBarraLateral, GrupoBarraLateral, AccionGrupoBarraLateral, ContenidoGrupoBarraLateral, EtiquetaGrupoBarraLateral, EncabezadoBarraLateral, EntradaBarraLateral, InsetBarraLateral, MenuBarraLateral, AccionMenuBarraLateral, InsigniaMenuBarraLateral, BotonMenuBarraLateral, ElementoMenuBarraLateral, EsqueletoMenuBarraLateral, SubMenuBarraLateral, BotonSubMenuBarraLateral, ElementoSubMenuBarraLateral, ProveedorBarraLateral, RielBarraaLateral, SeparadorBarraLateral, DisparadorBarraLateral, usarBarraLateral };
