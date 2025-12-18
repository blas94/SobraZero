import { obtenerToken } from "./sesion";

const API_BASE = import.meta.env.VITE_API_URL;
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

    const res = await fetch(`${API_BASE}${path}`, {
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