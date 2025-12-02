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

        <h1 className="sr-only">Autenticación - SobraZero</h1>

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
