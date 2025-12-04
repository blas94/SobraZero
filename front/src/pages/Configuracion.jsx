import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Lock, CreditCard, Trash2 } from "lucide-react";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Boton } from "@/components/ui/boton";
import { Interruptor } from "@/components/ui/interruptor";
import { Etiqueta } from "@/components/ui/etiqueta";
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
} from "@/components/ui/dialogo-alerta";
import {
  Dialogo,
  ContenidoDialogo,
  DescripcionDialogo,
  PieDialogo,
  EncabezadoDialogo,
  TituloDialogo,
} from "@/components/ui/dialogo";
import {
  obtenerTarjetasGuardadas,
  agregarTarjeta,
  eliminarTarjeta,
  establecerTarjetaPrincipal,
} from "@/services/metodos-pago";
import { usarTema } from "@/hooks/usar-tema";

const Configuracion = () => {
  const navegar = useNavigate();
  const { esModoOscuro, alternarModoOscuro } = usarTema();
  const [mostrarDialogoEliminar, setMostrarDialogoEliminar] = useState(false);

  const [tarjetas, setTarjetas] = useState([]);
  const [mostrarListadoTarjetas, setMostrarListadoTarjetas] = useState(false);
  const [dialogoTarjetaAbierto, setDialogoTarjetaAbierto] = useState(false);

  const [alias, setAlias] = useState("");
  const [numero, setNumero] = useState("");
  const [marca, setMarca] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");

  const [usuario] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })

  const normalizarTarjetas = (data) =>
    Array.isArray(data) ? data : data?.tarjetas ?? [];

  const cargarTarjetas = async () => {
    try {
      const userId = usuario?.id || usuario?._id;
      if (!userId) return;

      const data = await obtenerTarjetasGuardadas(userId);
      setTarjetas(normalizarTarjetas(data));
    } catch (error) {
      console.error("Error obteniendo tarjetas:", error);
      toast.error("No se pudieron cargar las tarjetas guardadas");
      setTarjetas([]);
    }
  };

  useEffect(() => {
    cargarTarjetas();
  }, [usuario]);

  const limpiarFormularioTarjeta = () => {
    setAlias("");
    setNumero("");
    setMarca("");
    setVencimiento("");
    setCvv("");
  };

  const manejarToggleModoOscuro = () => {
    alternarModoOscuro();
    toast.success(!esModoOscuro ? "Modo oscuro activado" : "Modo claro activado");
  };

  const manejarEliminarCuenta = () => {
    toast.success("Cuenta eliminada correctamente");
    setMostrarDialogoEliminar(false);
  };

  const manejarSubmitTarjeta = async (e) => {
    e.preventDefault();

    if (!alias.trim() || !numero.trim()) {
      toast.error("Completá el alias y el número de tarjeta");
      return;
    }

    const numeroLimpio = numero.replace(/\D/g, "");
    if (numeroLimpio.length < 12) {
      toast.error("Número de tarjeta inválido (usá uno de prueba)");
      return;
    }

    try {
      await agregarTarjeta({
        usuarioId: usuario?.id || usuario?._id,
        alias: alias.trim(),
        marca: marca.trim() || "Tarjeta",
        ultimos4: numeroLimpio.slice(-4),
        esPrincipal: tarjetas.length === 0,
      });

      toast.success("Tarjeta guardada");
      limpiarFormularioTarjeta();
      setDialogoTarjetaAbierto(false);
      cargarTarjetas();
    } catch (error) {
      console.error("Error guardando tarjeta:", error);
      toast.error("No se pudo guardar la tarjeta");
    }
  };

  const manejarEliminarTarjeta = async (tarjetaId) => {
    if (!window.confirm("¿Eliminar esta tarjeta?")) return;
    try {
      await eliminarTarjeta(tarjetaId);
      toast.success("Tarjeta eliminada");
      cargarTarjetas();
    } catch (error) {
      console.error("Error eliminando tarjeta:", error);
      toast.error("No se pudo eliminar la tarjeta");
    }
  };

  const manejarMarcarPrincipal = async (tarjetaId) => {
    try {
      await establecerTarjetaPrincipal(tarjetaId);
      toast.success("Tarjeta principal actualizada");
      cargarTarjetas();
    } catch (error) {
      console.error("Error marcando tarjeta principal:", error);
      toast.error("No se pudo marcar la tarjeta como principal");
    }
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

        <Tarjeta className="p-4 space-y-2">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de pago
          </h2>

          <Boton
            variant="outline"
            className="w-full justify-between"
            type="button"
            onClick={() => setMostrarListadoTarjetas((prev) => !prev)}
          >
            Tarjetas guardadas
            {tarjetas.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {tarjetas.length}
              </span>
            )}
          </Boton>

          <Boton
            className="w-full justify-between"
            type="button"
            onClick={() => setDialogoTarjetaAbierto(true)}
          >
            Agregar método de pago
          </Boton>

          {mostrarListadoTarjetas && (
            <div className="mt-3 space-y-2">
              {tarjetas.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">
                  No tenés tarjetas guardadas.
                </p>
              ) : (
                tarjetas.map((tarjeta) => (
                  <div
                    key={tarjeta._id ?? tarjeta.id}
                    className="flex items-center justify-between border rounded-md px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {tarjeta.alias}{" "}
                        {tarjeta.esPrincipal && (
                          <span className="text-xs text-primary">
                            (principal)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tarjeta.marca || "Tarjeta"} - terminada en{" "}
                        {tarjeta.ultimos4}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!tarjeta.esPrincipal && (
                        <Boton
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() =>
                            manejarMarcarPrincipal(tarjeta._id ?? tarjeta.id)
                          }
                        >
                          Marcar principal
                        </Boton>
                      )}
                      <Boton
                        variant="destructive"
                        size="sm"
                        type="button"
                        onClick={() =>
                          manejarEliminarTarjeta(tarjeta._id ?? tarjeta.id)
                        }
                      >
                        Eliminar
                      </Boton>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Privacidad y seguridad
          </h2>
          <div className="space-y-2">
            <button className="w-full text-left p-3 hover:bg-muted/50 rounded-md text-sm">
              Cambiar contraseña
            </button>
            <button className="w-full text-left p-3 hover:bg-muted/50 rounded-md text-sm">
              Verificación en dos pasos
            </button>
            <button className="w-full text-left p-3 hover:bg-muted/50 rounded-md text-sm">
              Datos personales
            </button>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 border-destructive/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Zona de peligro
          </h2>
          <Boton
            variant="outline"
            className="w-full bg-background text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
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

      <Dialogo
        open={dialogoTarjetaAbierto}
        onOpenChange={setDialogoTarjetaAbierto}
      >
        <ContenidoDialogo>
          <EncabezadoDialogo>
            <TituloDialogo>Agregar método de pago</TituloDialogo>
            <DescripcionDialogo>
              Ingresá una tarjeta de prueba de Mercado Pago.
            </DescripcionDialogo>
          </EncabezadoDialogo>
          <form onSubmit={manejarSubmitTarjeta} className="space-y-3 mt-2">
            <div>
              <Etiqueta className="text-sm">Alias</Etiqueta>
              <input
                className="mt-1 w-full border rounded-md px-2 py-1 text-sm bg-background"
                placeholder="Ej: Visa personal"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                aria-label="Alias de la tarjeta"
              />
            </div>

            <div>
              <Etiqueta className="text-sm">Número de tarjeta</Etiqueta>
              <input
                className="mt-1 w-full border rounded-md px-2 py-1 text-sm bg-background"
                placeholder="0000 0000 0000 0000"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                maxLength={19}
                aria-label="Número de tarjeta"
              />
            </div>

            <div className="flex gap-2">
              <div className="w-full">
                <Etiqueta className="text-sm">Marca</Etiqueta>
                <input
                  className="mt-1 w-full border rounded-md px-2 py-1 text-sm bg-background"
                  placeholder="Visa, Master..."
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  aria-label="Marca de la tarjeta"
                />
              </div>
              <div className="w-20">
                <Etiqueta className="text-sm">CVV</Etiqueta>
                <input
                  className="mt-1 w-full border rounded-md px-2 py-1 text-sm bg-background"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  aria-label="Código de seguridad"
                />
              </div>
            </div>

            <PieDialogo className="mt-2">
              <Boton type="submit" className="flex-1">
                Guardar tarjeta
              </Boton>
              <Boton
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDialogoTarjetaAbierto(false);
                  limpiarFormularioTarjeta();
                }}
              >
                Cancelar
              </Boton>
            </PieDialogo>
          </form>
        </ContenidoDialogo>
      </Dialogo>

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
