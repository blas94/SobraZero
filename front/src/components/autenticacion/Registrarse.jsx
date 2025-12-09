import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boton } from "@/components/ui/Boton";
import { Entrada } from "@/components/ui/Entrada";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";
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
import { registrarCuenta } from "@/services/autenticacion";

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

const Registrarse = ({ onCambiarPestana }) => {
    const navegar = useNavigate();
    const [cargando, setCargando] = useState(false);

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
        <div>
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
                            onClick={() => onCambiarPestana("inicio")}
                            className="text-primary hover:underline"
                        >
                            Iniciá sesión
                        </button>
                    </p>
                </form>
            </Formulario>
        </div>
    );
};

export default Registrarse;
