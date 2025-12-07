import {
  ShoppingBag,
  Salad,
  Croissant,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Boton } from "@/components/ui/Boton";

const categorias = [
  { id: "all", label: "Todos", icon: Store },
  { id: "panaderia", label: "Panadería", icon: Croissant },
  { id: "supermercado", label: "Supermercado", icon: ShoppingBag },
  { id: "verduleria", label: "Verdulería", icon: Salad },
  { id: "restaurante", label: "Restaurante", icon: UtensilsCrossed },
];

const FiltrosComercio = ({ categoriaSeleccionada, alCambiarCategoria }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categorias.map((categoria) => {
        const Icono = categoria.icon;
        const estaSeleccionada = categoriaSeleccionada === categoria.id;

        return (
          <Boton
            key={categoria.id}
            variant={estaSeleccionada ? "default" : "outline"}
            size="sm"
            onClick={() => alCambiarCategoria(categoria.id)}
            className="flex-shrink-0 gap-2"
          >
            <Icono className="w-4 h-4" />
            {categoria.label}
          </Boton>
        );
      })}
    </div>
  );
};

export default FiltrosComercio;
