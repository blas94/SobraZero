import { createContext, useContext, useEffect, useState } from "react";
import { verificarSesion, cerrarSesion } from "@/services/autenticacion";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                // 1. Intentar validar la cookie/token con el backend
                const { user, token } = await verificarSesion();
                setUsuario(user);
                // Persistencia local
                localStorage.setItem("user", JSON.stringify(user));
                // Si la sesión retorna nuevo token (opcional), guardarlo. 
                // Pero verificarSesion normalmente solo retorna user y validación.
                // En este caso, confiamos en el token que ya pueda estar almacenado o refrescado.
            } catch (error) {
                // 2. Si falla (401/403), no hay sesión válida
                setUsuario(null);
                localStorage.removeItem("user");
                localStorage.removeItem("token"); // Limpiar token también
            } finally {
                setCargando(false);
            }
        };

        checkUser();
    }, []);

    const login = (data) => {
        // Data debe contener { user, token }
        setUsuario(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) {
            localStorage.setItem("token", data.token); // Guardar token para próximas requests
        }
    };

    const logout = async () => {
        try {
            await cerrarSesion();
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
        setUsuario(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
