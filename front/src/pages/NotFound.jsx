import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Boton } from "@/components/ui/Boton";
import { SearchX } from "lucide-react";

const NotFound = () => {
  const navegar = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center max-w-md">
        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <SearchX className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          404
        </h1>

        <h2 className="text-2xl font-semibold mb-3">
          ¿Te perdiste?
        </h2>

        <p className="text-muted-foreground mb-8 text-base">
          No encontramos la página que estás buscando. Puede ser que la dirección sea incorrecta o que la página haya sido movida.
        </p>

        <Boton onClick={() => navegar("/inicio")} size="lg" className="w-full sm:w-auto">
          Volver al inicio
        </Boton>
      </div>
    </div>
  );
};

export default NotFound;
