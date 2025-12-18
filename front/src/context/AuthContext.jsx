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
    const [usuario, setUsuario] = useState(() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                // ✅ tu /auth/verificar devuelve { autenticado, user }
                const data = await verificarSesion();

                const user = data?.user || null;

                if (user) {
                    if (user.vioTutorial === undefined) user.vioTutorial = false;

                    console.log("Sesión verificada:", user);
                    setUsuario(user);
                    localStorage.setItem("user", JSON.stringify(user));

                    // si backend devuelve token alguna vez, lo guardamos (por compat)
                    if (data?.token) {
                        localStorage.setItem("token", data.token);
                    }
                } else {
                    // si no vino user, sesión inválida
                    setUsuario(null);
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.log("Sesión no válida o expirada:", error);
                setUsuario(null);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            } finally {
                setCargando(false);
            }
        };

        checkUser();
    }, []);

    const login = (data) => {
        // Data debe contener { user, token }
        const user = data?.user || null;
        const token = data?.token || null;

        setUsuario(user);
        localStorage.setItem("user", JSON.stringify(user));

        if (token) {
            localStorage.setItem("token", token);
        }
    };

    const updateUser = (user) => {
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
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ usuario, cargando, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
