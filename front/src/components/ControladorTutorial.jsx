import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tutorial } from "@/components/Tutorial";
import { marcarTutorialVisto, registrarPasoTutorial } from "@/services/autenticacion";
import { Heart, User, ShoppingBag } from "lucide-react";
export function ControladorTutorial() {
    const { usuario, updateUser } = useAuth();
    const [abierto, setAbierto] = useState(false);
    const ubicacion = useLocation();
    // Estado para saber si ya gestionó la ubicación (solo relevante para /inicio)
    const [permisoUbicacionConsultado, setPermisoUbicacionConsultado] = useState(false);
    // Actualizar estado basado en localStorage específico del usuario
    useEffect(() => {
        if (usuario?.id) {
            const consultado = !!localStorage.getItem(`permisoUbicacionConsultado_${usuario.id}`);
            setPermisoUbicacionConsultado(consultado);
        }
    }, [usuario?.id]);
    // Escuchar evento (para actualización en tiempo real cuando el usuario acepta/deniega)
    useEffect(() => {
        const manejarUbicacionGestionada = () => {
            setPermisoUbicacionConsultado(true);
        };
        window.addEventListener("ubicacionGestionada", manejarUbicacionGestionada);
        return () => window.removeEventListener("ubicacionGestionada", manejarUbicacionGestionada);
    }, []);
    // DEFINICIÓN DE PASOS
    const pasos = useMemo(() => ({
        "/inicio": {
            esBienvenida: true,
            titulo: "Bienvenido a SobraZero",
            descripcion: "En la pantalla de Inicio encontrarás las mejores ofertas cerca de tu ubicación. ¡No te pierdas nada!",
            textoBoton: "Continuar"
        },
        "/pedidos": {
            icono: <ShoppingBag className="w-12 h-12 text-primary mb-4" />,
            titulo: "Pedidos",
            descripcion: "Seguí el estado de tus reservas en tiempo real. Desde la confirmación hasta el retiro.",
            textoBoton: "Continuar"
        },
        "/favoritos": {
            icono: <Heart className="w-12 h-12 text-primary mb-4" />,
            titulo: "Favoritos",
            descripcion: "Guardá tus comercios preferidos para acceder rápido a sus ofertas cuando lo necesites.",
            textoBoton: "Continuar"
        },
        "/perfil": {
            icono: <User className="w-12 h-12 text-primary mb-4" />,
            titulo: "Perfil",
            descripcion: "Gestioná tus datos, configurá notificaciones y revisá tu historial de pedidos fácilmente.",
            textoBoton: "Finalizar",
            esUltimo: true
        }
    }), []);
    const pasoActual = pasos[ubicacion.pathname];
    // LÓGICA DE VISUALIZACIÓN
    const pasosVistosBD = usuario?.tutorialPasos || [];
    // CONDICIÓN ESPECIAL: Si estamos en /inicio, DEBEMOS esperar a que acepte/deniegue ubicación
    const enInicio = ubicacion.pathname === "/inicio";
    const esperaUbicacion = enInicio && !permisoUbicacionConsultado;
    const debeMostrar =
        usuario &&
        usuario.vioTutorial === false &&
        pasoActual &&
        !pasosVistosBD.includes(ubicacion.pathname) &&
        !esperaUbicacion;
    useEffect(() => {
        if (debeMostrar) {
            const temporizador = setTimeout(() => {
                setAbierto(true);
            }, 800);
            return () => clearTimeout(temporizador);
        } else {
            setAbierto(false);
        }
    }, [debeMostrar, ubicacion.pathname]);
    // ACCIONES
    const finalizarTutorialCompleto = async () => {
        setAbierto(false);
        if (!usuario) return;
        updateUser({ ...usuario, vioTutorial: true });
        try {
            await marcarTutorialVisto();
        } catch (error) {
            console.error("Error al finalizar tutorial", error);
        }
    };
    const navegar = useNavigate();
    // MAPA DE NAVEGACIÓN
    const siguientePaso = useMemo(() => ({
        "/inicio": "/pedidos",
        "/pedidos": "/favoritos",
        "/favoritos": "/perfil",
        "/perfil": null // Último paso
    }), []);
    const manejarAceptar = async () => {
        setAbierto(false);
        if (!usuario) return;
        const nuevosPasos = [...pasosVistosBD, ubicacion.pathname];
        updateUser({ ...usuario, tutorialPasos: nuevosPasos });
        try {
            await registrarPasoTutorial(ubicacion.pathname);
        } catch (error) {
            console.error("Error guardando paso tutorial:", error);
        }
        if (pasoActual?.esUltimo) {
            finalizarTutorialCompleto();
        } else {
            // Navegar automáticamente al siguiente paso
            const proximo = siguientePaso[ubicacion.pathname];
            if (proximo) {
                setTimeout(() => {
                    navegar(proximo);
                }, 300); // Pequeño delay para suavizar la transición
            }
        }
    };
    if (!debeMostrar && !abierto) return null;
    return (
        <Tutorial
            abierto={abierto}
            paso={pasoActual}
            alCompletar={manejarAceptar}
            alSaltar={finalizarTutorialCompleto}
            textoBoton={pasoActual?.textoBoton || "Aceptar"}
        />
    );
}