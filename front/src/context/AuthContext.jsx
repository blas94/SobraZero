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
                // 1. Intentar validar la cookie con el backend
                const { user } = await verificarSesion();
                setUsuario(user);
                // Actualizamos localStorage solo para tener una referencia rápida si se necesita en otros scripts no-React
                localStorage.setItem("user", JSON.stringify(user));
            } catch (error) {
                // 2. Si falla (401/403), no hay sesión válida
                setUsuario(null);
                localStorage.removeItem("user");
            } finally {
                setCargando(false);
            }
        };

        checkUser();
    }, []);

    const login = (user) => {
        setUsuario(user);
        localStorage.setItem("user", JSON.stringify(user));
    };

    const logout = async () => {
        try {
            await cerrarSesion();
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
        setUsuario(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
