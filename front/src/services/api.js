import { obtenerToken } from "./sesion";

const API_BASE =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:3000" : "");

const normalizar = (url = "") => String(url || "").replace(/\/+$/, "");

export async function apiFetch(path, opciones = {}) {
    const token = obtenerToken();

    const headers = {
        ...(opciones.headers || {}),
    };

    const tieneBody = opciones.body !== undefined && opciones.body !== null;
    if (tieneBody && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const base = normalizar(API_BASE) || "";
    const pathLimpio = String(path || "");
    const pathConSlash = pathLimpio.startsWith("/")
        ? pathLimpio
        : `/${pathLimpio}`;
    const url = base ? `${base}/api${pathConSlash}` : `/api${pathConSlash}`;

    const res = await fetch(url, {
        ...opciones,
        headers,
        credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg = data?.error || data?.mensaje || "Error en la solicitud";
        throw new Error(msg);
    }

    return data;
}
