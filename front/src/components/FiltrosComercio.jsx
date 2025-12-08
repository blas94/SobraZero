import { categorias } from "@/data/categorias-comercios";
import { Boton } from "@/components/ui/Boton";

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
