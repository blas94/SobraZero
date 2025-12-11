import {
    Dialogo,
    ContenidoDialogo,
    TituloDialogo,
    DescripcionDialogo,
    PieDialogo,
} from "@/components/ui/Dialogo";
import { Boton } from "@/components/ui/Boton";
import { MapPin } from "lucide-react";

export function PermisoUbicacion({ open, onAccept, onDeny }) {
    return (
        <Dialogo open={open} onOpenChange={onDeny}>
            <ContenidoDialogo className="sm:max-w-[425px] bg-[#EDE8E3] dark:bg-background dark:border-border border-none shadow-xl">
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <TituloDialogo className="text-xl text-foreground font-bold">
                            Encontrá ofertas cerca tuyo
                        </TituloDialogo>
                        <DescripcionDialogo className="text-muted-foreground text-base">
                            Para mostrarte las mejores ofertas y comercios cerca tuyo, necesitamos acceder a tu ubicación.
                        </DescripcionDialogo>
                    </div>
                </div>

                <PieDialogo className="sm:justify-center flex-col sm:flex-row gap-2">
                    <Boton variant="outline" onClick={onDeny} className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 text-primary">
                        Ahora no
                    </Boton>
                    <Boton onClick={onAccept} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
                        Permitir ubicación
                    </Boton>
                </PieDialogo>
            </ContenidoDialogo>
        </Dialogo>
    );
}
