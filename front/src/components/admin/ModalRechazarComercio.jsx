import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import {
    Dialogo,
    ContenidoDialogo,
    EncabezadoDialogo,
    TituloDialogo,
    DescripcionDialogo,
    PieDialogo,
} from "@/components/ui/Dialogo";
import { Entrada } from "@/components/ui/Entrada";

const ModalRechazarComercio = ({ open, onOpenChange, onConfirm, nombreComercio }) => {
    const [razon, setRazon] = useState("");

    const handleConfirm = () => {
        onConfirm(razon);
        setRazon("");
    };

    const handleCancel = () => {
        setRazon("");
        onOpenChange(false);
    };

    return (
        <Dialogo open={open} onOpenChange={onOpenChange}>
            <ContenidoDialogo>
                <EncabezadoDialogo>
                    <TituloDialogo>Rechazar Comercio</TituloDialogo>
                    <DescripcionDialogo>
                        ¿Estás seguro que querés rechazar el comercio "{nombreComercio}"?
                    </DescripcionDialogo>
                </EncabezadoDialogo>

                <div className="py-4">
                    <label className="block text-sm font-medium mb-2">
                        Razón del rechazo (opcional)
                    </label>
                    <Entrada
                        value={razon}
                        onChange={(e) => setRazon(e.target.value)}
                        placeholder="Ej: Información incompleta, documentación faltante..."
                        className="w-full"
                    />
                </div>

                <PieDialogo>
                    <Boton variant="outline" onClick={handleCancel}>
                        Cancelar
                    </Boton>
                    <Boton variant="destructive" onClick={handleConfirm}>
                        Rechazar Comercio
                    </Boton>
                </PieDialogo>
            </ContenidoDialogo>
        </Dialogo>
    );
};

export default ModalRechazarComercio;
