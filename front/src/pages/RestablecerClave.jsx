import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Boton } from "@/components/ui/Boton";
import { Entrada } from "@/components/ui/Entrada";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { restablecerClave } from "@/services/autenticacion";
import {
    Formulario,
    ControlFormulario,
    CampoFormulario,
    ItemFormulario,
    EtiquetaFormulario,
    MensajeFormulario,
} from "@/components/ui/Formulario";
import logo from "@/assets/logo.png";

const esquemaReset = z.object({
    newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

const RestablecerClave = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navegar = useNavigate();
    const [enviando, setEnviando] = useState(false);

    const formulario = useForm({
        resolver: zodResolver(esquemaReset),
        mode: 'onChange', // Validar en cada cambio para actualizar errores en tiempo real
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const manejarEnvio = async (data) => {
        if (!token) {
            toast.error("Token no válido");
            return;
        }

        setEnviando(true);
        try {
            await restablecerClave(token, data.newPassword);
            toast.success("Contraseña actualizada exitosamente");
            setTimeout(() => navegar("/autenticacion"), 2000);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Error al restablecer contraseña");
        } finally {
            setEnviando(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Tarjeta className="p-6 text-center">
                    <h1 className="text-xl font-bold text-red-600">Enlace inválido</h1>
                    <p className="mt-2 text-sm text-gray-600">El enlace no contiene un token válido.</p>
                    <Boton onClick={() => navegar("/autenticacion")} className="mt-4">Volver al inicio</Boton>
                </Tarjeta>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Tarjeta className="p-6 w-full max-w-md">
                <div className="text-center mb-6">
                    <img src={logo} alt="SobraZero" className="w-24 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Nueva Contraseña</h1>
                    <p className="text-sm text-gray-500">Ingresá tu nueva contraseña</p>
                </div>

                <Formulario {...formulario}>
                    <form onSubmit={formulario.handleSubmit(manejarEnvio)} className="space-y-4">
                        <CampoFormulario
                            control={formulario.control}
                            name="newPassword"
                            render={({ field }) => (
                                <ItemFormulario>
                                    <EtiquetaFormulario className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> Nueva contraseña
                                    </EtiquetaFormulario>
                                    <ControlFormulario>
                                        <Entrada {...field} type="password" />
                                    </ControlFormulario>
                                    <MensajeFormulario />
                                </ItemFormulario>
                            )}
                        />

                        <CampoFormulario
                            control={formulario.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <ItemFormulario>
                                    <EtiquetaFormulario className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> Confirmar contraseña
                                    </EtiquetaFormulario>
                                    <ControlFormulario>
                                        <Entrada {...field} type="password" />
                                    </ControlFormulario>
                                    <MensajeFormulario />
                                </ItemFormulario>
                            )}
                        />

                        <Boton type="submit" className="w-full" disabled={enviando}>
                            {enviando ? "Restableciendo..." : "Cambiar Contraseña"}
                        </Boton>
                    </form>
                </Formulario>
            </Tarjeta>
        </div>
    );
};

export default RestablecerClave;
