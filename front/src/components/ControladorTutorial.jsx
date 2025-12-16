import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tutorial } from "@/components/Tutorial";
import { marcarTutorialVisto } from "@/services/autenticacion";
import { Heart, User, ShoppingBag } from "lucide-react";

export function ControladorTutorial() {
    const { usuario, updateUser } = useAuth();
    const [abierto, setAbierto] = useState(false);
    const ubicacion = useLocation();

    // Recuperar pasos vistos desde localStorage para este usuario
    const getPasosVistos = () => {
        if (!usuario) return [];
        const guardados = localStorage.getItem(`tutorial_vistos_${usuario.id}`);
        return guardados ? JSON.parse(guardados) : [];
    };

    const [pasosVistos, setPasosVistos] = useState([]);

    // Sincronizar estado inicial al cargar usuario
    useEffect(() => {
        if (usuario) {
            setPasosVistos(getPasosVistos());
        }
    }, [usuario?.id]);

    // Definición de pasos
    const pasos = useMemo(() => ({
        "/inicio": {
            esBienvenida: true,
            titulo: "Bienvenido a SobraZero",
            descripcion: "En la pantalla de Inicio encontrarás las mejores ofertas cerca de tu ubicación. ¡No te pierdas nada!",
            textoBoton: "Entendido"
        },
        "/pedidos": {
            icono: <ShoppingBag className="w-12 h-12 text-primary mb-4" />,
            titulo: "Pedidos",
            descripcion: "Seguí el estado de tus reservas en tiempo real. Desde la confirmación hasta el retiro.",
            textoBoton: "Entendido"
        },
        "/favoritos": {
            icono: <Heart className="w-12 h-12 text-primary mb-4" />,
            titulo: "Favoritos",
            descripcion: "Guardá tus comercios preferidos para acceder rápido a sus ofertas cuando lo necesites.",
            textoBoton: "Entendido"
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

    // Determinar si debemos mostrar el modal
    const debeMostrar =
        usuario &&
        usuario.vioTutorial === false &&
        pasoActual &&
        !pasosVistos.includes(ubicacion.pathname);

    useEffect(() => {
        if (debeMostrar) {
            // Pequeño delay para renderizado
            const temporizador = setTimeout(() => {
                setAbierto(true);
            }, 800);
            return () => clearTimeout(temporizador);
        } else {
            setAbierto(false);
        }
    }, [debeMostrar, ubicacion.pathname]);

    const finalizarTutorialCompleto = async () => {
        setAbierto(false);
        if (!usuario) return;

        // Actualizamos backend y contexto para que no vuelva a aparecer NUNCA
        updateUser({ ...usuario, vioTutorial: true });
        try {
            await marcarTutorialVisto();
        } catch (error) {
            console.error("Error al finalizar tutorial", error);
        }
    };

    const manejarAceptar = () => {
        setAbierto(false);

        // 1. Marcar paso actual como visto localmente
        const nuevosVistos = [...pasosVistos, ubicacion.pathname];
        setPasosVistos(nuevosVistos);
        localStorage.setItem(`tutorial_vistos_${usuario.id}`, JSON.stringify(nuevosVistos));

        // 2. Si es el último paso o una acción especial, finalizamos todo
        if (pasoActual?.esUltimo) {
            finalizarTutorialCompleto();
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