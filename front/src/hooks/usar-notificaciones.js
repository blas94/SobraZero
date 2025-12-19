import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Clock, Package } from "lucide-react";
/**
 * @param {string} usuarioId 
 */
export const usarNotificaciones = (usuarioId) => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);

    const storageKey = usuarioId ? `notificaciones_usuario_${usuarioId}` : null;

    const cargarNotificaciones = useCallback(() => {
        if (!storageKey) {
            setNotificaciones([]);
            return;
        }
        try {
            const guardadas = localStorage.getItem(storageKey);
            if (guardadas) {
                const parsed = JSON.parse(guardadas);
                const conIconos = parsed.map(n => ({
                    ...n,
                    icon: obtenerIconoPorTipo(n.type)
                }));
                setNotificaciones(conIconos);
            } else {
                setNotificaciones([]);
            }
        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
            setNotificaciones([]);
        }
    }, [storageKey]);

    useEffect(() => {
        cargarNotificaciones();
        const manejarEvento = () => cargarNotificaciones();
        window.addEventListener('notificaciones_actualizadas', manejarEvento);

        const manejarStorage = (e) => {
            if (e.key === storageKey) cargarNotificaciones();
        };
        window.addEventListener('storage', manejarStorage);
        return () => {
            window.removeEventListener('notificaciones_actualizadas', manejarEvento);
            window.removeEventListener('storage', manejarStorage);
        };
    }, [cargarNotificaciones, storageKey]);

    useEffect(() => {
        setNoLeidas(notificaciones.filter(n => n.unread).length);
    }, [notificaciones]);
    const guardarYNotificar = (nuevasNotificaciones) => {
        if (!storageKey) return;
        const paraGuardar = nuevasNotificaciones.map(({ icon, ...resto }) => resto);
        localStorage.setItem(storageKey, JSON.stringify(paraGuardar));
        window.dispatchEvent(new Event('notificaciones_actualizadas'));
    };
    const agregarNotificacion = useCallback(({ titulo, descripcion, tipo = 'info' }) => {
        if (!storageKey) return;
        setNotificaciones(prev => {
            const nuevaNotificacion = {
                id: crypto.randomUUID(),
                title: titulo,
                description: descripcion,
                type: tipo,
                time: 'Hace un momento',
                timestamp: Date.now(),
                unread: true,
                icon: obtenerIconoPorTipo(tipo)
            };

            const nuevas = [nuevaNotificacion, ...prev];
            guardarYNotificar(nuevas);
            return nuevas;
        });
    }, [storageKey]);
    const marcarComoLeida = useCallback((id) => {
        setNotificaciones(prev => {
            const nuevas = prev.map(n => n.id === id ? { ...n, unread: false } : n);
            guardarYNotificar(nuevas);
            return nuevas;
        });
    }, []);
    const eliminarNotificacion = useCallback((id) => {
        setNotificaciones(prev => {
            const nuevas = prev.filter(n => n.id !== id);
            guardarYNotificar(nuevas);
            return nuevas;
        });
    }, []);
    const limpiarTodas = useCallback(() => {
        guardarYNotificar([]);
        setNotificaciones([]);
    }, []);
    return {
        notificaciones,
        noLeidas,
        agregarNotificacion,
        marcarComoLeida,
        eliminarNotificacion,
        limpiarTodas
    };
};

const obtenerIconoPorTipo = (tipo) => {
    switch (tipo) {
        case 'order':
            return CheckCircle2;
        case 'promo':
            return Package;
        case 'reminder':
            return Clock;
        case 'business':
            return Store;
        default:
            return HelpCircle;
    }
};
import { HelpCircle, Store } from "lucide-react";