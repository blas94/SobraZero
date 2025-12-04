import * as React from "react";

const PUNTO_QUIEBRE_CELULAR = 768;

export function usarEsCelular() {
    const [esCelular, setEsCelular] = React.useState(undefined);

    React.useEffect(() => {
        const consultaMedia = window.matchMedia(`(max-width: ${PUNTO_QUIEBRE_CELULAR - 1}px)`);

        const alCambiar = () => {
            setEsCelular(window.innerWidth < PUNTO_QUIEBRE_CELULAR);
        };

        consultaMedia.addEventListener("change", alCambiar);
        setEsCelular(window.innerWidth < PUNTO_QUIEBRE_CELULAR);

        return () => consultaMedia.removeEventListener("change", alCambiar);
    }, []);

    return !!esCelular;
}
