import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Lock, CreditCard, Trash2 } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Interruptor } from "@/components/ui/Interruptor";
import { Etiqueta } from "@/components/ui/Etiqueta";
import FormasDecorativas from "@/components/FormasDecorativas";
import { toast } from "sonner";
import {
  DialogoAlerta,
  AccionDialogoAlerta,
  CancelarDialogoAlerta,
  ContenidoDialogoAlerta,
  DescripcionDialogoAlerta,
  PieDialogoAlerta,
  EncabezadoDialogoAlerta,
  TituloDialogoAlerta,
} from "@/components/ui/DialogoAlerta";
import { usarTema } from "@/hooks/usar-tema";

const Configuracion = () => {
  const navegar = useNavigate();
  const { esModoOscuro, alternarModoOscuro } = usarTema();
  const [mostrarDialogoEliminar, setMostrarDialogoEliminar] = useState(false);

  const [usuario, setUsuario] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      setUsuario(userStr ? JSON.parse(userStr) : null);
    } catch {
      setUsuario(null);
    }
  }, []);

  const manejarToggleModoOscuro = () => {
    alternarModoOscuro();
    toast.success(
      !esModoOscuro ? "Modo oscuro activado" : "Modo claro activado"
    );
  };

  const manejarEliminarCuenta = () => {
    toast.success("Cuenta eliminada correctamente");
    setMostrarDialogoEliminar(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <Boton
            variant="ghost"
            size="icon"
            onClick={() => navegar("/perfil")}
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Boton>
          <h1 className="text-2xl font-bold">Configuración</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 relative z-10">
        <Tarjeta className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Apariencia
          </h2>
          <div className="flex items-center justify-between">
            <Etiqueta className="cursor-pointer">Modo oscuro</Etiqueta>
            <Interruptor
              checked={esModoOscuro}
              onCheckedChange={manejarToggleModoOscuro}
            />
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de pago
          </h2>

          <h3 className="font-medium">Mercado Pago</h3>
          <p className="text-sm text-muted-foreground">
            Para mayor seguridad,{" "}
            <span className="font-medium">
              SobraZero procesa todos los pagos a través de Mercado Pago
            </span>
            .
            <br />
            Esto permite operar con los estándares de seguridad de la
            plataforma, proteger tus datos y confirmar las transacciones de
            forma confiable al momento de reservar.
          </p>
        </Tarjeta>

        <Tarjeta className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Privacidad y seguridad
          </h2>
          <div className="space-y-2">
            <button
              className="w-full text-left p-3 hover:bg-muted/50 rounded-md text-sm"
              onClick={() => navegar("/cambiar-clave")}
            >
              Cambiar contraseña
            </button>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 border-destructive/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-red-600 dark:text-red-500">
            <Trash2 className="w-5 h-5" />
            Zona de peligro
          </h2>
          <Boton
            variant="outline"
            className="w-full group bg-background text-red-600 dark:text-red-500 border-red-500/50 hover:bg-red-600 hover:!text-white hover:border-red-600"
            type="button"
            onClick={() => setMostrarDialogoEliminar(true)}
          >
            Eliminar cuenta
          </Boton>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Esta acción no se puede deshacer.
          </p>
        </Tarjeta>
      </main>

      <DialogoAlerta
        open={mostrarDialogoEliminar}
        onOpenChange={setMostrarDialogoEliminar}
      >
        <ContenidoDialogoAlerta>
          <EncabezadoDialogoAlerta>
            <TituloDialogoAlerta>
              ¿Estás seguro de eliminar la cuenta?
            </TituloDialogoAlerta>
            <DescripcionDialogoAlerta>
              Esta acción no se puede deshacer.
            </DescripcionDialogoAlerta>
          </EncabezadoDialogoAlerta>
          <PieDialogoAlerta>
            <CancelarDialogoAlerta>Cancelar</CancelarDialogoAlerta>
            <AccionDialogoAlerta
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={manejarEliminarCuenta}
            >
              Confirmar
            </AccionDialogoAlerta>
          </PieDialogoAlerta>
        </ContenidoDialogoAlerta>
      </DialogoAlerta>
    </div>
  );
};

export default Configuracion;