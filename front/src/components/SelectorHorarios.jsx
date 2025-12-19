import { useState } from "react";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Entrada } from "@/components/ui/Entrada";
import { CasillaVerificacion } from "@/components/ui/CasillaVerificacion";

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

    return (
        <div className="space-y-4">
            <Etiqueta>Horarios de atención</Etiqueta>

            <div className="space-y-3 border border-border rounded-lg p-4">
                {DIAS_SEMANA.map((dia, index) => (
                    <div
                        key={dia.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-border last:border-b-0 last:pb-0"
                    >
                        {/* Día + Checkbox + "Abierto" agrupados */}
                        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-3 sm:justify-start">
                            <span className="text-sm font-medium">{dia.label}</span>
                            <div className="flex items-center gap-2">
                                <CasillaVerificacion
                                    checked={horarios[index]?.abierto ?? true}
                                    onCheckedChange={(checked) =>
                                        manejarCambio(index, "abierto", checked)
                                    }
                                />
                                <span className="text-sm text-muted-foreground">Abierto</span>
                            </div>
                        </div>

                        {/* Horarios */}
                        {horarios[index]?.abierto && (
                            <div className="flex items-center gap-2 flex-1">
                                <Entrada
                                    type="time"
                                    value={horarios[index]?.horaApertura || "09:00"}
                                    onChange={(e) =>
                                        manejarCambio(index, "horaApertura", e.target.value)
                                    }
                                    className="w-full sm:w-28"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Entrada
                                    type="time"
                                    value={horarios[index]?.horaCierre || "18:00"}
                                    onChange={(e) =>
                                        manejarCambio(index, "horaCierre", e.target.value)
                                    }
                                    className="w-full sm:w-28"
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
