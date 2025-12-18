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
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Tarjeta } from "@/components/ui/Tarjeta";
import { Boton } from "@/components/ui/Boton";
import { Avatar, RespaldoAvatar, ImagenAvatar } from "@/components/ui/Avatar";
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
} from "@/components/ui/DialogoAlerta";

import { obtenerPerfil } from "@/services/autenticacion";
import { authHttp } from "@/services/http-client";
import { useAuth } from "@/context/AuthContext";
import { obtenerMisComercios } from "@/services/comercios";

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
  const { logout } = useAuth();
  const [mostrarDialogoSalir, setMostrarDialogoSalir] = useState(false);
  const [tieneComercioRegistrado, setTieneComercioRegistrado] = useState(false);
  const [miComercio, setMiComercio] = useState(null);
  const [cargandoComercio, setCargandoComercio] = useState(true);

  const [usuario, setUsuario] = useState(() => {
    const almacenado = localStorage.getItem("user");
    if (almacenado) {
      try {
        const parsed = JSON.parse(almacenado);
        return {
          nombre: parsed.nombre || parsed.name || "Usuario",
          avatar: parsed.avatar || null,
          pedidosCompletados:
            parsed.completedOrders ?? parsed.pedidosCompletados ?? 0,
        };
      } catch {
        return { nombre: "Usuario", avatar: null, pedidosCompletados: 0 };
      }
    }
    return { nombre: "Usuario", avatar: null, pedidosCompletados: 0 };
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfil();
        const usuarioBackend = data.user || data.usuario || data;
        if (!usuarioBackend) return;

        const perfilMapeado = {
          nombre: usuarioBackend.nombre || usuarioBackend.name || "Usuario",
          avatar: usuarioBackend.avatar || null,
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

    const cargarComercio = async () => {
      try {
        setCargandoComercio(true);
        const comercios = await obtenerMisComercios();

        if (comercios.length > 0) {
          setMiComercio(comercios[0]);
          setTieneComercioRegistrado(true);
        } else {
          setMiComercio(null);
          setTieneComercioRegistrado(false);
        }
      } catch (error) {
        console.error("Error cargando comercio:", error);
        setMiComercio(null);
        setTieneComercioRegistrado(false);
      } finally {
        setCargandoComercio(false);
      }
    };

    cargarPerfil();
    cargarComercio();
  }, []);

  const manejarCerrarSesion = async () => {
    await logout();

    toast.success("Sesión cerrada correctamente");
    setMostrarDialogoSalir(false);
    navegar("/autenticacion", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Mi perfil</h1>
        </div>
      </header>

      <main className="px-3 py-4 space-y-4 relative z-10">
        <Tarjeta className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="w-20 h-20 mb-3">
              <ImagenAvatar src={usuario.avatar} />
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

        {/* Tarjeta Mi Comercio */}
        {!cargandoComercio && miComercio && (
          <Tarjeta className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{miComercio.nombre}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {miComercio.rubro}
                  </p>
                </div>
              </div>
              <Boton
                size="sm"
                variant="outline"
                onClick={() => navegar("/perfil/editar-comercio")}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Boton>
            </div>

            {/* Estado del comercio */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado de aprobación:</span>
                {miComercio.estadoAprobacion === "pendiente_revision" && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      En revisión
                    </span>
                  </div>
                )}
                {miComercio.estadoAprobacion === "aprobado" && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Aprobado
                    </span>
                  </div>
                )}
                {miComercio.estadoAprobacion === "rechazado" && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      Rechazado
                    </span>
                  </div>
                )}
              </div>

              {miComercio.estadoAprobacion === "aprobado" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visibilidad en mapa:</span>
                  {miComercio.activo ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Activo
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-900">
                      <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                        Inactivo
                      </span>
                    </div>
                  )}
                </div>
              )}

              {miComercio.estadoAprobacion === "pendiente_revision" && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Tu comercio está siendo revisado. En menos de 24 hs recibirás una notificación.
                  </p>
                </div>
              )}

              {miComercio.estadoAprobacion === "rechazado" && miComercio.razonRechazo && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                    Razón del rechazo:
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {miComercio.razonRechazo}
                  </p>
                </div>
              )}
            </div>
          </Tarjeta>
        )}

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
          className="w-full group bg-background text-red-600 dark:text-red-500 border-red-500/50 hover:bg-red-600 hover:!text-white hover:border-red-600"
          onClick={() => setMostrarDialogoSalir(true)}
        >
          <LogOut className="w-5 h-5 mr-2 group-hover:text-white" />
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
