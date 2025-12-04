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
import { usarTema } from "@/hooks/usar-tema";

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
  const { esModoOscuro } = usarTema();

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

  const manejarInicioSesion = async (datos) => {
    setCargando(true);
    try {
      const { user } = await iniciarSesion({
        email: datos.email,
        clave: datos.clave,
      });

      // Solo guardar user - el token está en la cookie HttpOnly
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
      const { user } = await registrarCuenta({
        nombre: datos.nombre,
        email: datos.email,
        tel: datos.tel,
        ubicacion: datos.ubicacion,
        clave: datos.clave,
      });

      // Solo guardar user - el token está en la cookie HttpOnly
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

        <Tarjeta className="w-full max-w-md p-6 shadow-xl border-border/50 bg-card/50 backdrop-blur-sm relative z-10">
          <div className="text-center mb-6">
            <h1 className="sr-only">Autenticación - SobraZero</h1>
            <img
              src={esModoOscuro ? logoDark : logo}
              alt="Logo de SobraZero"
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
              <h2 className="sr-only">Iniciar sesión</h2>
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
                        <EtiquetaFormulario>Email</EtiquetaFormulario>
                        <ControlFormulario>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Entrada
                              placeholder="tu@email.com"
                              className="pl-9"
                              {...field}
                            />
                          </div>
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
                        <EtiquetaFormulario>Contraseña</EtiquetaFormulario>
                        <ControlFormulario>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Entrada
                              type="password"
                              placeholder="••••••"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <div className="flex justify-end">
                    <Link
                      to="/recuperar-password"
                      className="text-sm text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
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
              <h2 className="sr-only">Registrarse</h2>
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
                        <EtiquetaFormulario>Nombre completo</EtiquetaFormulario>
                        <ControlFormulario>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Entrada
                              placeholder="Juan Pérez"
                              className="pl-9"
                              {...field}
                            />
                          </div>
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
                        <EtiquetaFormulario>Email</EtiquetaFormulario>
                        <ControlFormulario>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Entrada
                              placeholder="tu@email.com"
                              className="pl-9"
                              {...field}
                            />
                          </div>
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
                        <EtiquetaFormulario>Teléfono</EtiquetaFormulario>
                        <ControlFormulario>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Entrada
                              placeholder="11 1234 5678"
                              className="pl-9"
                              {...field}
                            />
                          </div>
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
                        <EtiquetaFormulario>Ubicación</EtiquetaFormulario>
                        <ControlFormulario>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Entrada
                              placeholder="Calle 123, Ciudad"
                              className="pl-9"
                              {...field}
                            />
                          </div>
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
                        <EtiquetaFormulario>Contraseña</EtiquetaFormulario>
                        <ControlFormulario>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Entrada
                              type="password"
                              placeholder="••••••"
                              className="pl-9"
                              {...field}
                            />
                          </div>
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
                        <EtiquetaFormulario>Confirmar contraseña</EtiquetaFormulario>
                        <ControlFormulario>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Entrada
                              type="password"
                              placeholder="••••••"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </ControlFormulario>
                        <MensajeFormulario />
                      </ItemFormulario>
                    )}
                  />

                  <Boton type="submit" className="w-full" disabled={cargando}>
                    {cargando ? "Registrando..." : "Crear cuenta"}
                  </Boton>

                  <p className="text-sm text-center mt-3">
                    ¿Ya tenés cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setPestanaActiva("inicio")}
                      className="text-primary hover:underline"
                    >
                      Iniciá sesión
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
