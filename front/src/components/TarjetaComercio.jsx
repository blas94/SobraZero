import { MapPin, Clock, Star, TrendingDown, Heart, X } from "lucide-react";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Insignia } from "@/components/ui/insignia";

const TarjetaComercio = ({
  nombre,
  categoria,
  distancia,
  calificacion,
  totalResenas,
  descuento,
  horarioRetiro,
  disponibles,
  imagenUrl,
  onClick,
  esFavorito,
  alAlternarFavorito,
  usarIconoCruz = false,
  nivelEncabezado = "h3",
}) => {
  const EtiquetaTitulo = nivelEncabezado;

  return (
    <Tarjeta
      className="overflow-hidden cursor-pointer transition-all hover:shadow-card-hover active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
          {imagenUrl ? (
            <img
              src={imagenUrl}
              alt={`Imagen de portada de ${nombre}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <IconoComercio className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <EtiquetaTitulo className="font-semibold text-sm truncate">{nombre}</EtiquetaTitulo>
            {esFavorito ? (
              <button
                onClick={alAlternarFavorito}
                className={`flex-shrink-0 transition-transform hover:scale-110 ${esFavorito ? "text-success" : "text-muted-foreground"
                  }`}
              >
                {usarIconoCruz ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Heart className="w-6 h-6 fill-success" />
                )}
              </button>
            ) : (
              <Insignia
                variant="secondary"
                className="flex-shrink-0 bg-success-light text-success border-0"
              >
                <TrendingDown className="w-3 h-3 mr-1" />
                {descuento}%
              </Insignia>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2 capitalize">
            {categoria}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {distancia}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {calificacion} ({totalResenas})
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {horarioRetiro}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            {disponibles} unidades disponibles
          </p>
        </div>
      </div>
    </Tarjeta>
  );
};

const IconoComercio = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
    <path d="M12 3v6" />
  </svg>
);

export default TarjetaComercio;
