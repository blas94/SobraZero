import { MapPin } from "lucide-react";

const VistaMapa = ({ comercios, onComercioClick }) => {
  return (
    <div className="relative w-full h-[400px] bg-muted rounded-xl overflow-hidden shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin className="w-12 h-12 mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Mapa interactivo</p>
          <p className="text-xs text-muted-foreground">
            {comercios.length} comercios cercanos
          </p>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {comercios.slice(0, 5).map((comercio, index) => (
          <div
            key={comercio.id}
            className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`,
            }}
            onClick={() => onComercioClick?.(comercio.id)}
          >
            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-card-hover">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaMapa;
