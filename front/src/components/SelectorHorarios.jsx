import { useState } from "react";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Entrada } from "@/components/ui/Entrada";
import { CasillaVerificacion } from "@/components/ui/CasillaVerificacion";
import { Boton } from "@/components/ui/Boton";
import { Copy, Calendar } from "lucide-react";

const DIAS_SEMANA = [
    { id: "lunes", label: "Lunes" },
    { id: "martes", label: "Martes" },
    { id: "miercoles", label: "Miércoles" },
    { id: "jueves", label: "Jueves" },
    { id: "viernes", label: "Viernes" },
    { id: "sabado", label: "Sábado" },
    { id: "domingo", label: "Domingo" },
];

const SelectorHorarios = ({ value = [], onChange, error }) => {
    // Inicializar horarios si está vacío
    const [horarios, setHorarios] = useState(() => {
        if (value && value.length > 0) return value;

        // Valores por defecto: todos abiertos de 09:00 a 18:00
        return DIAS_SEMANA.map(dia => ({
            dia: dia.id,
            abierto: true,
            horaApertura: "09:00",
            horaCierre: "18:00",
        }));
    });

    const actualizarHorarios = (nuevosHorarios) => {
        setHorarios(nuevosHorarios);
        onChange(nuevosHorarios);
    };

    const manejarCambio = (index, campo, valor) => {
        const nuevosHorarios = [...horarios];
        nuevosHorarios[index] = {
            ...nuevosHorarios[index],
            [campo]: valor,
        };
        actualizarHorarios(nuevosHorarios);
    };

    const copiarATodos = () => {
        const primerDia = horarios[0];
        const nuevosHorarios = horarios.map(h => ({
            ...h,
            abierto: primerDia.abierto,
            horaApertura: primerDia.horaApertura,
            horaCierre: primerDia.horaCierre,
        }));
        actualizarHorarios(nuevosHorarios);
    };

    const copiarLunesAViernes = () => {
        const lunes = horarios[0];
        const nuevosHorarios = horarios.map((h, index) => {
            // Aplicar a lunes-viernes (índices 0-4)
            if (index <= 4) {
                return {
                    ...h,
                    abierto: lunes.abierto,
                    horaApertura: lunes.horaApertura,
                    horaCierre: lunes.horaCierre,
                };
            }
            return h;
        });
        actualizarHorarios(nuevosHorarios);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Etiqueta>Horarios de atención</Etiqueta>
                <div className="flex gap-2">
                    <Boton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copiarLunesAViernes}
                        className="text-xs"
                    >
                        <Calendar className="w-3 h-3 mr-1" />
                        Lun-Vie
                    </Boton>
                    <Boton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copiarATodos}
                        className="text-xs"
                    >
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar a todos
                    </Boton>
                </div>
            </div>

            <div className="space-y-3 border border-border rounded-lg p-4">
                {DIAS_SEMANA.map((dia, index) => (
                    <div
                        key={dia.id}
                        className="flex items-center gap-3 pb-3 border-b border-border last:border-b-0 last:pb-0"
                    >
                        <div className="w-24 flex-shrink-0">
                            <span className="text-sm font-medium">{dia.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CasillaVerificacion
                                checked={horarios[index]?.abierto ?? true}
                                onCheckedChange={(checked) =>
                                    manejarCambio(index, "abierto", checked)
                                }
                            />
                            <span className="text-sm text-muted-foreground">Abierto</span>
                        </div>

                        {horarios[index]?.abierto && (
                            <div className="flex items-center gap-2 flex-1">
                                <Entrada
                                    type="time"
                                    value={horarios[index]?.horaApertura || "09:00"}
                                    onChange={(e) =>
                                        manejarCambio(index, "horaApertura", e.target.value)
                                    }
                                    className="w-28"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Entrada
                                    type="time"
                                    value={horarios[index]?.horaCierre || "18:00"}
                                    onChange={(e) =>
                                        manejarCambio(index, "horaCierre", e.target.value)
                                    }
                                    className="w-28"
                                />
                            </div>
                        )}

                        {!horarios[index]?.abierto && (
                            <span className="text-sm text-muted-foreground italic">
                                Cerrado
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
            )}

            <p className="text-xs text-muted-foreground">
                Estos horarios indican cuándo tu comercio está disponible para retiros.
            </p>
        </div>
    );
};

export default SelectorHorarios;
