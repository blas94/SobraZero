import { ArrowLeft, Bell } from "lucide-react";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Boton } from "@/components/ui/boton";
import { Interruptor } from "@/components/ui/interruptor";
import { Etiqueta } from "@/components/ui/etiqueta";
import { Separador } from "@/components/ui/separador";
import FormasDecorativas from "@/components/FormasDecorativas";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Notificaciones = () => {
  const navegar = useNavigate();
  const [notificarNuevosComercios, setNotificarNuevosComercios] =
    useState(true);
  const [notificarOfertas, setNotificarOfertas] = useState(true);
  const [notificarPedidos, setNotificarPedidos] = useState(true);
  const [notificarPush, setNotificarPush] = useState(false);

  const manejarToggle = (setter, nombrePreferencia) => {
    return (checked) => {
      setter(checked);
      toast.success(
        checked
          ? `${nombrePreferencia} activadas`
          : `${nombrePreferencia} desactivadas`
      );
    };
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <FormasDecorativas />
      <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <Boton
            variant="ghost"
            size="icon"
            onClick={() => navegar("/perfil")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Boton>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 relative z-10">
        <Tarjeta className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferencias de notificaciones
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Etiqueta htmlFor="notify-new-stores" className="cursor-pointer">
                  Nuevos comercios
                </Etiqueta>
                <p className="text-xs text-muted-foreground mt-1">
                  Cuando se sumen comercios cerca de ti
                </p>
              </div>
              <Interruptor
                id="notify-new-stores"
                checked={notificarNuevosComercios}
                onCheckedChange={manejarToggle(
                  setNotificarNuevosComercios,
                  "Notificaciones de nuevos comercios"
                )}
              />
            </div>

            <Separador />

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Etiqueta htmlFor="notify-offers" className="cursor-pointer">
                  Ofertas especiales
                </Etiqueta>
                <p className="text-xs text-muted-foreground mt-1">
                  Descuentos y promociones exclusivas
                </p>
              </div>
              <Interruptor
                id="notify-offers"
                checked={notificarOfertas}
                onCheckedChange={manejarToggle(
                  setNotificarOfertas,
                  "Notificaciones de ofertas"
                )}
              />
            </div>

            <Separador />

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Etiqueta htmlFor="notify-orders" className="cursor-pointer">
                  Estado de pedidos
                </Etiqueta>
                <p className="text-xs text-muted-foreground mt-1">
                  Actualizaciones sobre tus reservas
                </p>
              </div>
              <Interruptor
                id="notify-orders"
                checked={notificarPedidos}
                onCheckedChange={manejarToggle(
                  setNotificarPedidos,
                  "Notificaciones de pedidos"
                )}
              />
            </div>

            <Separador />

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Etiqueta htmlFor="notify-push" className="cursor-pointer">
                  Notificaciones push
                </Etiqueta>
                <p className="text-xs text-muted-foreground mt-1">
                  Recibe alertas sobre ofertas cercanas
                </p>
              </div>
              <Interruptor
                id="notify-push"
                checked={notificarPush}
                onCheckedChange={manejarToggle(
                  setNotificarPush,
                  "Notificaciones push"
                )}
              />
            </div>
          </div>
        </Tarjeta>
      </main>
    </div>
  );
};

export default Notificaciones;
