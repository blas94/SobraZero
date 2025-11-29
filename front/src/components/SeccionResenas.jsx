import { Star, User } from "lucide-react";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Avatar, RespaldoAvatar } from "@/components/ui/avatar";

const SeccionResenas = ({ resenas, calificacionPromedio, totalResenas }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {calificacionPromedio.toFixed(1)}
          </div>
          <div className="flex gap-0.5 justify-center my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= calificacionPromedio
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted"
                  }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalResenas} resenas
          </p>
        </div>

        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const cantidad = resenas.filter(
              (resena) => resena.calificacion === rating
            ).length;
            const porcentaje =
              totalResenas > 0 ? (cantidad / totalResenas) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-xs w-3">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {cantidad}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {resenas.map((resena) => (
          <Tarjeta key={resena.id} className="p-3">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <RespaldoAvatar className="bg-primary/10 text-primary">
                  <User className="w-5 h-5" />
                </RespaldoAvatar>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {resena.nombreUsuario}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {resena.fecha}
                  </span>
                </div>

                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= resena.calificacion
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                        }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-foreground leading-relaxed">
                  {resena.comentario}
                </p>
              </div>
            </div>
          </Tarjeta>
        ))}
      </div>
    </div>
  );
};

export default SeccionResenas;
