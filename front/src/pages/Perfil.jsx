import {
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  Edit,
  ShoppingBag,
  Leaf,
  DollarSign,
  Store,
} from "lucide-react";

import { Tarjeta } from "@/components/ui/tarjeta";
import { Boton } from "@/components/ui/boton";
import { Avatar, RespaldoAvatar } from "@/components/ui/avatar";
import NavegacionInferior from "@/components/NavegacionInferior";
import FormasDecorativas from "@/components/FormasDecorativas";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

import { obtenerPerfil } from "@/services/autenticacion";
import { authHttp } from "@/services/http-client";

const opcionesMenu = [
  {
    icono: Edit,
    etiqueta: "Editar perfil",
    ruta: "/perfil/editar",
  },
  {
    icono: Settings,
    etiqueta: "Configuración",
    ruta: "/perfil/configuracion",
  },
  {
    icono: Bell,
    etiqueta: "Notificaciones",
    ruta: "/perfil/notificaciones",
  },
  {
    icono: Store,
    etiqueta: "Registrá tu comercio",
    ruta: "/perfil/registrar-comercio",
    ocultarSiTieneComercio: true,
  },
  {
    icono: Edit,
    etiqueta: "Editar tu comercio",
    ruta: "/perfil/editar-comercio",
    soloMostrarSiTieneComercio: true,
  },
  {
    icono: HelpCircle,
    etiqueta: "Centro de ayuda",
    ruta: "/perfil/centro-ayuda",
  },
];

const Perfil = () => {
  const navegar = useNavigate();
  const [mostrarDialogoSalir, setMostrarDialogoSalir] = useState(false);
  const [tieneComercioRegistrado, setTieneComercioRegistrado] = useState(false);

  const [usuario, setUsuario] = useState(() => {
    const almacenado = localStorage.getItem("user");
    if (almacenado) {
      try {
        const parsed = JSON.parse(almacenado);
        return {
          nombre: parsed.nombre || parsed.name || "Usuario",
          pedidosCompletados:
            parsed.completedOrders ?? parsed.pedidosCompletados ?? 0,
        };
      } catch {
        return { nombre: "Usuario", pedidosCompletados: 0 };
      }
    }
    return { nombre: "Usuario", pedidosCompletados: 0 };
  });

  useEffect(() => {
    const comercioRegistrado = localStorage.getItem("comercioRegistrado");
    setTieneComercioRegistrado(!!comercioRegistrado);

    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfil();
        const usuarioBackend = data.user || data.usuario || data;
        if (!usuarioBackend) return;

        const perfilMapeado = {
          nombre: usuarioBackend.nombre || usuarioBackend.name || "Usuario",
          pedidosCompletados:
            usuarioBackend.completedOrders ??
            usuarioBackend.pedidosCompletados ??
            0,
        };

        setUsuario(perfilMapeado);
        localStorage.setItem("user", JSON.stringify(usuarioBackend));
      } catch (error) {
        console.error("Error obteniendo perfil en /perfil:", error);
      }
    };

    cargarPerfil();
  }, []);

  const manejarCerrarSesion = async () => {
    try {
      await authHttp.post("/auth/logout");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }

    localStorage.removeItem("user");

    toast.success("Sesión cerrada correctamente");
    setMostrarDialogoSalir(false);
    navegar("/autenticacion", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Mi perfil</h1>
        </div>
      </header>

      <main className="px-3 py-4 space-y-4 relative z-10">
        <Tarjeta className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="w-20 h-20 mb-3">
              <RespaldoAvatar className="bg-primary/10 text-primary text-2xl">
                {usuario.nombre
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </RespaldoAvatar>
            </Avatar>
            <h2 className="text-xl font-bold">{usuario.nombre}</h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/20">
              <Leaf className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-primary mb-1">
                {usuario.pedidosCompletados * 2.5}kg
              </p>
              <p className="text-xs text-muted-foreground">salvados</p>
            </div>

            <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/20">
              <DollarSign className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-primary mb-1">
                {(usuario.pedidosCompletados * 450).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">ahorrados</p>
            </div>

            <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/20">
              <ShoppingBag className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-primary mb-1">
                {usuario.pedidosCompletados}
              </p>
              <p className="text-xs text-muted-foreground">pedidos</p>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="divide-y divide-border">
          {opcionesMenu
            .filter((item) => {
              if (item.ocultarSiTieneComercio && tieneComercioRegistrado)
                return false;
              if (item.soloMostrarSiTieneComercio && !tieneComercioRegistrado)
                return false;
              return true;
            })
            .map((item, index) => {
              const Icono = item.icono;
              return (
                <button
                  key={`${item.ruta}-${index}`}
                  onClick={() => navegar(item.ruta)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icono className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{item.etiqueta}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
        </Tarjeta>

        <Boton
          variant="outline"
          size="lg"
          className="w-full bg-background text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
          onClick={() => setMostrarDialogoSalir(true)}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar sesión
        </Boton>
      </main>

      <DialogoAlerta
        open={mostrarDialogoSalir}
        onOpenChange={setMostrarDialogoSalir}
      >
        <ContenidoDialogoAlerta>
          <EncabezadoDialogoAlerta>
            <TituloDialogoAlerta>
              ¿Estás seguro de cerrar sesión?
            </TituloDialogoAlerta>
            <DescripcionDialogoAlerta>
              Deberás volver a iniciar sesión para acceder a tu cuenta.
            </DescripcionDialogoAlerta>
          </EncabezadoDialogoAlerta>
          <PieDialogoAlerta>
            <CancelarDialogoAlerta>Cancelar</CancelarDialogoAlerta>
            <AccionDialogoAlerta onClick={manejarCerrarSesion}>
              Confirmar
            </AccionDialogoAlerta>
          </PieDialogoAlerta>
        </ContenidoDialogoAlerta>
      </DialogoAlerta>

      <NavegacionInferior />
    </div>
  );
};

export default Perfil;
