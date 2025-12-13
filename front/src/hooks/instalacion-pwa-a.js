import { useEffect, useState } from "react";

export function usarInstalacionPwaAndroid() {
    const [eventoInstalacion, setEventoInstalacion] = useState(null);
    const [esInstalable, setEsInstalable] = useState(false);

    useEffect(() => {
        const manejarAntesDeInstalar = (evento) => {
            evento.preventDefault();
            setEventoInstalacion(evento);
            setEsInstalable(true);
        };

        const manejarAppInstalada = () => {
            setEsInstalable(false);
            setEventoInstalacion(null);
        };

        window.addEventListener("beforeinstallprompt", manejarAntesDeInstalar);
        window.addEventListener("appinstalled", manejarAppInstalada);

        return () => {
            window.removeEventListener("beforeinstallprompt", manejarAntesDeInstalar);
            window.removeEventListener("appinstalled", manejarAppInstalada);
        };
    }, []);

    const pedirInstalacion = async () => {
        if (!eventoInstalacion) return;

        eventoInstalacion.prompt();
        await eventoInstalacion.userChoice;

        setEventoInstalacion(null);
        setEsInstalable(false);
    };

    return { esInstalable, pedirInstalacion };
}