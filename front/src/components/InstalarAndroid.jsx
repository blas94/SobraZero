import { useEffect, useMemo, useState } from "react";
import { usarInstalacionPwaAndroid } from "../hooks/instalacion-pwa-a";

const CLAVE_LOCALSTORAGE = "sobrazero_instalar_android_v1";

function esAndroid() {
    return /Android/i.test(navigator.userAgent);
}

export default function InstalarAndroid() {
    const { esInstalable, pedirInstalacion } = usarInstalacionPwaAndroid();
    const [mostrar, setMostrar] = useState(false);

    const yaVioBanner = useMemo(() => {
        return localStorage.getItem(CLAVE_LOCALSTORAGE) === "1";
    }, []);

    useEffect(() => {
        if (esAndroid() && esInstalable && !yaVioBanner) {
            setMostrar(true);
        }
    }, [esInstalable, yaVioBanner]);

    if (!mostrar) return null;

    const cerrar = () => {
        localStorage.setItem(CLAVE_LOCALSTORAGE, "1");
        setMostrar(false);
    };

    const instalar = async () => {
        await pedirInstalacion();
        localStorage.setItem(CLAVE_LOCALSTORAGE, "1");
        setMostrar(false);
    };

    return (
        <div
            style={{
                position: "fixed",
                left: 16,
                right: 16,
                top: 16,
                background: "#3D7B53",
                color: "white",
                padding: 14,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                zIndex: 9999,
                boxShadow: "0 10px 25px rgba(64,123,65,0.35)",
            }}
        >
            <div style={{ fontSize: 14, lineHeight: 1.25 }}>
                <strong style={{ display: "block", marginBottom: 2 }}>
                    Instalá SobraZero
                </strong>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={cerrar}
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.35)",
                        color: "white",
                        padding: "8px 10px",
                        borderRadius: 10,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                    }}
                >
                    Ahora no
                </button>

                <button
                    onClick={instalar}
                    style={{
                        background: "white",
                        border: "none",
                        color: "#3D7B53",
                        padding: "8px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                    }}
                >
                    Instalar
                </button>
            </div>
        </div>
    );
}