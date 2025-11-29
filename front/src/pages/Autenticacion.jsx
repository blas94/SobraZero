import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Boton } from "@/components/ui/boton";
import { Entrada } from "@/components/ui/entrada";
import { Pestanas, ContenidoPestanas, ListaPestanas, ActivadorPestanas } from "@/components/ui/pestanas";
import { Mail, Lock, User, Phone, MapPin, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Formulario,
  ControlFormulario,
  CampoFormulario,
  ItemFormulario,
  EtiquetaFormulario,
  MensajeFormulario,
} from "@/components/ui/formulario";
import { iniciarSesion, registrarCuenta } from "@/services/autenticacion";

const esquemaInicioSesion = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  clave: z.string().trim().min(6, "Mínimo 6 caracteres").max(100),
});

const esquemaRegistro = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es requerido").max(100),
    email: z.string().trim().email("Email inválido").max(255),
    tel: z.string().trim().min(6, "Teléfono inválido").max(30),
    ubicacion: z.string().trim().min(2, "Ubicación requerida").max(120),
    clave: z.string().trim().min(6, "Mínimo 6 caracteres").max(100),
    confirmarClave: z.string().trim().min(6, "Mínimo 6 caracteres").max(100),
  })
  .refine((datos) => datos.clave === datos.confirmarClave, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarClave"],
  });

const Autenticacion = () => {
  const navegar = useNavigate();
  const [pestanaActiva, setPestanaActiva] = useState("inicio");
  const [cargando, setCargando] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const formularioInicio = useForm({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: { email: "", clave: "" },
  });

  const formularioRegistro = useForm({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      nombre: "",
      email: "",
      tel: "",
      ubicacion: "",
      clave: "",
      confirmarClave: "",
    },
  });

  useEffect(() => {
    const observador = new MutationObserver(() => {
      setModoOscuro(document.documentElement.classList.contains("dark"));
    });

    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observador.disconnect();
  }, []);

  const manejarInicioSesion = async (datos) => {
    setCargando(true);
    try {
      const { token, user } = await iniciarSesion({
        email: datos.email,
        clave: datos.clave,
      });

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Sesión iniciada correctamente");
      navegar("/");
    } catch (error) {
      const mensaje = error?.response?.data?.error || "Credenciales inválidas";
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const manejarRegistro = async (datos) => {
    setCargando(true);
    try {
      const { token, user } = await registrarCuenta({
        nombre: datos.nombre,
        email: datos.email,
        tel: datos.tel,
        ubicacion: datos.ubicacion,
        clave: datos.clave,
      });

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Cuenta creada correctamente");
      navegar("/");
    } catch (error) {
      const mensaje = error?.response?.data?.error || "Error al registrarse";
      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <Boton
          variant="ghost"
          size="sm"
          onClick={() => navegar("/")}
          className="absolute top-6 left-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Boton>

        <Tarjeta className="w-full max-w-md p-6 relative z-10">
          <div className="text-center mb-6">
            <img
              src={modoOscuro ? logoDark : logo}
              alt="SobraZero"
              className="w-36 mx-auto my-6"
              loading="eager"
              fetchPriority="high"
            />
            <p className="text-lg font-semibold text-primary italic">
              Salvá comida, ahorrá dinero
            </p>
          </div>

          <Pestanas value={pestanaActiva} onValueChange={setPestanaActiva}>
            <ListaPestanas className="grid w-full grid-cols-2 mb-6">
              <ActivadorPestanas value="inicio">Iniciar sesión</ActivadorPestanas>
              <ActivadorPestanas value="registro">Registrarse</ActivadorPestanas>
            </ListaPestanas>

            <ContenidoPestanas value="inicio">
              <Formulario {...formularioInicio}>
                <form
                  onSubmit={formularioInicio.handleSubmit(manejarInicioSesion)}
                  className="space-y-4"
                >
                  <CampoFormulario
                    control={formularioInicio.control}
                    name="email"
                    render={({ field }) => (
                      <ItemFormulario>
                        <EtiquetaFormulario className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          Email
                        </EtiquetaFormulario>
                        <ControlFormulario>
                          <Entrada
                            {...field}
                            type="email"
                            placeholder="tu@email.com"
                          />
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <CampoFormulario
                    control={formularioInicio.control}
                    name="clave"
                    render={({ field }) => (
                      <ItemFormulario>
                        <EtiquetaFormulario className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          Contraseña
                        </EtiquetaFormulario>
                        <ControlFormulario>
                          <Entrada
                            {...field}
                            type="password"
                            placeholder="********"
                          />
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <div className="text-sm text-muted-foreground text-center">
                    ¿Olvidaste tu contraseña?{" "}
                    <Link
                      to="/recuperar-password"
                      className="underline text-primary hover:text-primary/80"
                    >
                      Hace click aca
                    </Link>
                  </div>

                  <Boton type="submit" className="w-full" disabled={cargando}>
                    {cargando ? "Ingresando..." : "Iniciar sesión"}
                  </Boton>

                  <p className="text-sm text-center mt-3">
                    ¿No tenés cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setPestanaActiva("registro")}
                      className="text-primary hover:underline"
                    >
                      Registrate
                    </button>
                  </p>
                </form>
              </Formulario>
            </ContenidoPestanas>

            <ContenidoPestanas value="registro">
              <Formulario {...formularioRegistro}>
                <form
                  onSubmit={formularioRegistro.handleSubmit(manejarRegistro)}
                  className="space-y-4"
                >
                  <CampoFormulario
                    control={formularioRegistro.control}
                    name="nombre"
                    render={({ field }) => (
                      <ItemFormulario>
                        <EtiquetaFormulario className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          Nombre completo
                        </EtiquetaFormulario>
                        <ControlFormulario>
                          <Entrada {...field} placeholder="Tu nombre" />
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <CampoFormulario
                    control={formularioRegistro.control}
                    name="email"
                    render={({ field }) => (
                      <ItemFormulario>
                        <EtiquetaFormulario className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          Email
                        </EtiquetaFormulario>
                        <ControlFormulario>
                          <Entrada
                            {...field}
                            type="email"
                            placeholder="tu@email.com"
                          />
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <CampoFormulario
                    control={formularioRegistro.control}
                    name="tel"
                    render={({ field }) => (
                      <ItemFormulario>
                        <EtiquetaFormulario className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          Teléfono
                        </EtiquetaFormulario>
                        <ControlFormulario>
                          <Entrada {...field} placeholder="11 1234 5678" />
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <CampoFormulario
                    control={formularioRegistro.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <ItemFormulario>
                        <EtiquetaFormulario className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          Ubicación
                        </EtiquetaFormulario>
                        <ControlFormulario>
                          <Entrada
                            {...field}
                            placeholder="CABA, Villa Pueyrredón"
                          />
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <CampoFormulario
                    control={formularioRegistro.control}
                    name="clave"
                    render={({ field }) => (
                      <ItemFormulario>
                        <EtiquetaFormulario className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          Contraseña
                        </EtiquetaFormulario>
                        <ControlFormulario>
                          <Entrada
                            {...field}
                            type="password"
                            placeholder="********"
                          />
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <CampoFormulario
                    control={formularioRegistro.control}
                    name="confirmarClave"
                    render={({ field }) => (
                      <ItemFormulario>
                        <EtiquetaFormulario className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          Confirmar contraseña
                        </EtiquetaFormulario>
                        <ControlFormulario>
                          <Entrada
                            {...field}
                            type="password"
                            placeholder="********"
                          />
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <Boton type="submit" className="w-full" disabled={cargando}>
                    {cargando ? "Creando..." : "Crear cuenta"}
                  </Boton>

                  <p className="text-sm text-center mt-3">
                    ¿Ya tenés cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setPestanaActiva("inicio")}
                      className="text-primary hover:underline"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </form>
              </Formulario>
            </ContenidoPestanas>
          </Pestanas>
        </Tarjeta>
      </div>
    </div>
  );
};

export default Autenticacion;
