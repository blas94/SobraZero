import { useEffect, useState } from "react";

const CLAVE_LOCALSTORAGE = "sobrazero_instalar_ios_v1";

function esIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function estaInstaladaIOS() {
    return window.navigator.standalone === true;
}

export default function InstalarIOS() {
    const [mostrar, setMostrar] = useState(false);

    useEffect(() => {
        const yaVio = localStorage.getItem(CLAVE_LOCALSTORAGE) === "1";

        if (esIOS() && !estaInstaladaIOS() && !yaVio) {
            setMostrar(true);
        }
    }, []);

    if (!mostrar) return null;

    const cerrar = () => {
        localStorage.setItem(CLAVE_LOCALSTORAGE, "1");
        setMostrar(false);
    };

    return (
        <div
            style={{
                position: "fixed",
                left: 16,
                right: 16,
                bottom: 16,
                background: "rgba(15, 23, 42, 0.96)",
                color: "white",
                padding: 14,
                borderRadius: 14,
                zIndex: 9999,
                boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
            }}
        >
            <strong style={{ display: "block", marginBottom: 6 }}>
                Instalá SobraZero en iPhone
            </strong>

            <div style={{ fontSize: 14, lineHeight: 1.3, opacity: 0.9 }}>
                Tocá el botón <b>Compartir</b> (⬆️) y elegí{" "}
                <b>“Agregar a pantalla de inicio”</b>.
            </div>

            <button
                onClick={cerrar}
                style={{
                    marginTop: 10,
                    background: "white",
                    border: "none",
                    color: "#0f172a",
                    padding: "8px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 700,
                    width: "100%",
                }}
            >
                Entendido
            </button>
        </div>
    );
}