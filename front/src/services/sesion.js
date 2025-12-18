const CLAVE_SESION = "sobrazero_sesion_v1";

export function guardarSesion({ token, user }) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ token, user }));
}

export function obtenerSesion() {
    try {
        const raw = localStorage.getItem(CLAVE_SESION);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function borrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}

export function obtenerToken() {
    return obtenerSesion()?.token || null;
}

export function obtenerUsuario() {
    return obtenerSesion()?.user || null;
}

export function esAdministrador() {
    return obtenerUsuario()?.rol === "admin";
}
