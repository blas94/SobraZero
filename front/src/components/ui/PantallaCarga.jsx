import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import { usarTema } from "@/hooks/usar-tema";

export const PantallaCarga = ({ texto = "Cargando..." }) => {
    const { esModoOscuro } = usarTema();

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
            <div className="flex flex-col items-center animate-in fade-in duration-500">
                <img
                    src={esModoOscuro ? logoDark : logo}
                    alt="SobraZero"
                    className="w-32 mb-8 opacity-90"
                />
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground text-sm font-medium animate-pulse">
                    {texto}
                </p>
            </div>
        </div>
    );
};
