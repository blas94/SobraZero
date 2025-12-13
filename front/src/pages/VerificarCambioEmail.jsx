import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verificarCambioEmail, cerrarSesion } from "@/services/autenticacion";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Boton } from "@/components/ui/Boton";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const VerificarCambioEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navegar = useNavigate();
    const { logout } = useAuth(); // Hook para limpiar sesión local si es necesario

    const [estado, setEstado] = useState("cargando"); // cargando, exito, error
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        if (!token) {
            setEstado("error");
            setMensaje("Token no proporcionado");
            return;
        }

        const verificar = async () => {
            try {
                await verificarCambioEmail(token);
                setEstado("exito");
                // Forzar logout para que inicie sesión con el nuevo mail o refresque datos
                await logout();
            } catch (error) {
                setEstado("error");
                setMensaje(error.response?.data?.error || "Error al verificar el cambio de email");
            }
        };

        verificar();
    }, [token, logout]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Tarjeta className="p-8 max-w-md w-full text-center">
                {estado === "cargando" && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <h2 className="text-xl font-semibold">Verificando...</h2>
                    </div>
                )}

                {estado === "exito" && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Email Actualizado!</h2>
                        <p className="text-gray-600 mb-6">Tu dirección de correo ha sido confirmada correctamente.</p>
                        <Boton onClick={() => navegar("/autenticacion")} className="w-full">
                            Iniciar Sesión
                        </Boton>
                    </div>
                )}

                {estado === "error" && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                        <p className="text-red-600 mb-6">{mensaje}</p>
                        <Boton onClick={() => navegar("/inicio")} variant="outline">
                            Volver al Inicio
                        </Boton>
                    </div>
                )}
            </Tarjeta>
        </div>
    );
};

export default VerificarCambioEmail;
