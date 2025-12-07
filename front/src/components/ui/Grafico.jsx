import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Formato: { NOMBRE_TEMA: CSS_SELECTOR }
const TEMAS = { light: "", dark: ".dark" };

const ContextoGrafico = React.createContext(null);

function usarGrafico() {
    const contexto = React.useContext(ContextoGrafico);
    if (!contexto) {
        throw new Error("usarGrafico debe utilizarse dentro de un <ContenedorGrafico />");
    }
    return contexto;
}

const ContenedorGrafico = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
    const identificadorUnico = React.useId();
    const idGrafico = `chart-${id || identificadorUnico.replace(/:/g, "")}`;
    return (<ContextoGrafico.Provider value={{ config }}>
        <div data-chart={idGrafico} ref={ref} className={cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none", className)} {...props}>
            <EstiloGrafico id={idGrafico} config={config} />
            <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        </div>
    </ContextoGrafico.Provider>);
});
ContenedorGrafico.displayName = "ContenedorGrafico";

const EstiloGrafico = ({ id, config }) => {
    const configuracionColor = Object.entries(config).filter(([_, configuracion]) => configuracion.theme || configuracion.color);
    if (!configuracionColor.length) {
        return null;
    }
    return (<style dangerouslySetInnerHTML={{
        __html: Object.entries(TEMAS)
            .map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${configuracionColor
                    .map(([key, configuracionElemento]) => {
                        const color = configuracionElemento.theme?.[theme] || configuracionElemento.color;
                        return color ? `  --color-${key}: ${color};` : null;
                    })
                    .join("\n")}
}
`)
            .join("\n"),
    }} />);
};

const TooltipGrafico = RechartsPrimitive.Tooltip;

const ContenidoTooltipGrafico = React.forwardRef(({ active, payload, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, }, ref) => {
    const { config } = usarGrafico();
    const etiquetaTooltip = React.useMemo(() => {
        if (hideLabel || !payload?.length) {
            return null;
        }
        const [item] = payload;
        const key = `${labelKey || item.dataKey || item.name || "value"}`;
        const configuracionElemento = obtenerConfiguracionDesdePayload(config, item, key);
        const value = !labelKey && typeof label === "string"
            ? config[label]?.label || label
            : configuracionElemento?.label;
        if (labelFormatter) {
            return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>;
        }
        if (!value) {
            return null;
        }
        return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
    if (!active || !payload?.length) {
        return null;
    }
    const etiquetaAnidada = payload.length === 1 && indicator !== "dot";
    return (<div ref={ref} className={cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
        {!etiquetaAnidada ? etiquetaTooltip : null}
        <div className="grid gap-1.5">
            {payload.map((item, index) => {
                const key = `${nameKey || item.name || item.dataKey || "value"}`;
                const configuracionElemento = obtenerConfiguracionDesdePayload(config, item, key);
                const colorIndicador = color || item.payload.fill || item.color;
                return (<div key={item.dataKey} className={cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center")}>
                    {formatter && item?.value !== undefined && item.name ? (formatter(item.value, item.name, item, index, item.payload)) : (<>
                        {configuracionElemento?.icon ? (<configuracionElemento.icon />) : (!hideIndicator && (<div className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                            "my-0.5": etiquetaAnidada && indicator === "dashed",
                        })} style={{
                            "--color-bg": colorIndicador,
                            "--color-border": colorIndicador,
                        }} />))}
                        <div className={cn("flex flex-1 justify-between leading-none", etiquetaAnidada ? "items-end" : "items-center")}>
                            <div className="grid gap-1.5">
                                {etiquetaAnidada ? etiquetaTooltip : null}
                                <span className="text-muted-foreground">{configuracionElemento?.label || item.name}</span>
                            </div>
                            {item.value && (<span className="font-mono font-medium tabular-nums text-foreground">
                                {item.value.toLocaleString()}
                            </span>)}
                        </div>
                    </>)}
                </div>);
            })}
        </div>
    </div>);
});
ContenidoTooltipGrafico.displayName = "ContenidoTooltipGrafico";

const LeyendaGrafico = RechartsPrimitive.Legend;

const ContenidoLeyendaGrafico = React.forwardRef(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = usarGrafico();
    if (!payload?.length) {
        return null;
    }
    return (<div ref={ref} className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
        {payload.map((item) => {
            const key = `${nameKey || item.dataKey || "value"}`;
            const configuracionElemento = obtenerConfiguracionDesdePayload(config, item, key);
            return (<div key={item.value} className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}>
                {configuracionElemento?.icon && !hideIcon ? (<configuracionElemento.icon />) : (<div className="h-2 w-2 shrink-0 rounded-[2px]" style={{
                    backgroundColor: item.color,
                }} />)}
                {configuracionElemento?.label}
            </div>);
        })}
    </div>);
});
ContenidoLeyendaGrafico.displayName = "ContenidoLeyendaGrafico";

// Ayudante para extraer la configuración del elemento desde un payload.
function obtenerConfiguracionDesdePayload(config, payload, key) {
    if (typeof payload !== "object" || payload === null) {
        return undefined;
    }
    const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
        ? payload.payload
        : undefined;
    let configLabelKey = key;
    if (key in payload && typeof payload[key] === "string") {
        configLabelKey = payload[key];
    }
    else if (payloadPayload &&
        key in payloadPayload &&
        typeof payloadPayload[key] === "string") {
        configLabelKey = payloadPayload[key];
    }
    return configLabelKey in config ? config[configLabelKey] : config[key];
}

export { ContenedorGrafico, TooltipGrafico, ContenidoTooltipGrafico, LeyendaGrafico, ContenidoLeyendaGrafico, EstiloGrafico };
