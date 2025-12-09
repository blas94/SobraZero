import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Boton } from "@/components/ui/Boton";
import { Entrada } from "@/components/ui/Entrada";
import { Mail, Lock } from "lucide-react";
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
} from "@/components/ui/Formulario";
import { iniciarSesion } from "@/services/autenticacion";
import { useAuth } from "@/context/AuthContext";

const esquemaInicioSesion = z.object({
    email: z.string().trim().email("Email inválido").max(255),
    clave: z.string().trim().min(6, "Mínimo 6 caracteres").max(100),
});

const IniciarSesion = ({ onCambiarPestana }) => {
    const navegar = useNavigate();
    const { login } = useAuth(); // Usar login del contexto
    const [cargando, setCargando] = useState(false);

    const formularioInicio = useForm({
        resolver: zodResolver(esquemaInicioSesion),
        defaultValues: { email: "", clave: "" },
    });

    const manejarInicioSesion = async (datos) => {
        setCargando(true);
        try {
            const { user } = await iniciarSesion({
                email: datos.email,
                clave: datos.clave,
            });

            // Actualizar contexto. Esto disparará el redirect en Autenticacion.jsx si es necesario,
            // pero como estamos navegando manualmente abajo, aseguramos el estado.
            login(user);

            toast.success("Sesión iniciada correctamente");
            // Navegar a /inicio explícitamente, ya que / redirige a /autenticacion
            navegar("/inicio");
        } catch (error) {
            const mensaje = error?.response?.data?.error || "Credenciales inválidas";
            toast.error(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div>
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

                    <p className="text-sm text-center mt-2">
                        ¿Olvidaste tu contraseña?{" "}
                        <Link
                            to="/recuperar-password"
                            className="text-primary hover:underline"
                        >
                            Hacé click acá
                        </Link>
                    </p>

                    <Boton type="submit" className="w-full" disabled={cargando}>
                        {cargando ? "Ingresando..." : "Iniciar sesión"}
                    </Boton>

                    <p className="text-sm text-center mt-3">
                        ¿No tenés cuenta?{" "}
                        <button
                            type="button"
                            onClick={() => onCambiarPestana("registro")}
                            className="text-primary hover:underline"
                        >
                            Registrate
                        </button>
                    </p>
                </form>
            </Formulario>
        </div>
    );
};

export default IniciarSesion;
