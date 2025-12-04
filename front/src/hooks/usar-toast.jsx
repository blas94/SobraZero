import * as React from "react";

const LIMITE_TOAST = 1;
const RETRASO_REMOVER_TOAST = 1000000;

const tiposAccion = {
    AGREGAR_TOAST: "AGREGAR_TOAST",
    ACTUALIZAR_TOAST: "ACTUALIZAR_TOAST",
    DESCARTAR_TOAST: "DESCARTAR_TOAST",
    REMOVER_TOAST: "REMOVER_TOAST",
};

let contador = 0;

function generarId() {
    contador = (contador + 1) % Number.MAX_SAFE_INTEGER;
    return contador.toString();
}

const tiemposEsperaToast = new Map();

const agregarAColaRemover = (toastId) => {
    if (tiemposEsperaToast.has(toastId)) {
        return;
    }

    const tiempoEspera = setTimeout(() => {
        tiemposEsperaToast.delete(toastId);
        despachar({
            type: "REMOVER_TOAST",
            toastId: toastId,
        });
    }, RETRASO_REMOVER_TOAST);

    tiemposEsperaToast.set(toastId, tiempoEspera);
};

export const reductor = (estado, accion) => {
    switch (accion.type) {
        case "AGREGAR_TOAST":
            return {
                ...estado,
                toasts: [accion.toast, ...estado.toasts].slice(0, LIMITE_TOAST),
            };

        case "ACTUALIZAR_TOAST":
            return {
                ...estado,
                toasts: estado.toasts.map((t) =>
                    t.id === accion.toast.id ? { ...t, ...accion.toast } : t
                ),
            };

        case "DESCARTAR_TOAST": {
            const { toastId } = accion;

            if (toastId) {
                agregarAColaRemover(toastId);
            } else {
                estado.toasts.forEach((toast) => {
                    agregarAColaRemover(toast.id);
                });
            }

            return {
                ...estado,
                toasts: estado.toasts.map((t) =>
                    t.id === toastId || toastId === undefined
                        ? {
                            ...t,
                            open: false,
                        }
                        : t
                ),
            };
        }

        case "REMOVER_TOAST":
            if (accion.toastId === undefined) {
                return {
                    ...estado,
                    toasts: [],
                };
            }
            return {
                ...estado,
                toasts: estado.toasts.filter((t) => t.id !== accion.toastId),
            };
    }
};

const oyentes = [];
let estadoMemoria = { toasts: [] };

function despachar(accion) {
    estadoMemoria = reductor(estadoMemoria, accion);
    oyentes.forEach((oyente) => {
        oyente(estadoMemoria);
    });
}

function toast({ ...props }) {
    const id = generarId();

    const actualizar = (props) =>
        despachar({
            type: "ACTUALIZAR_TOAST",
            toast: { ...props, id },
        });

    const descartar = () => despachar({ type: "DESCARTAR_TOAST", toastId: id });

    despachar({
        type: "AGREGAR_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => {
                if (!open) descartar();
            },
        },
    });

    return {
        id: id,
        descartar,
        actualizar,
    };
}

function usarToast() {
    const [estado, setEstado] = React.useState(estadoMemoria);

    React.useEffect(() => {
        oyentes.push(setEstado);
        return () => {
            const indice = oyentes.indexOf(setEstado);
            if (indice > -1) {
                oyentes.splice(indice, 1);
            }
        };
    }, [estado]);

    return {
        ...estado,
        toast,
        descartar: (toastId) => despachar({ type: "DESCARTAR_TOAST", toastId }),
    };
}

export { usarToast, toast };
