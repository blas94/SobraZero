import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NavegacionInferior = () => {
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const navItems = [
    { path: "/inicio", label: "Inicio", icon: Home },
    { path: "/pedidos", label: "Pedidos", icon: ShoppingBag },
    { path: "/favoritos", label: "Favoritos", icon: Heart },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const activo = ubicacion.pathname === item.path;
          const Icono = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navegar(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                activo
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icono className={cn("w-5 h-5", activo && "fill-primary/20")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavegacionInferior;
