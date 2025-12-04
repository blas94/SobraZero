import { createContext, useContext, useState, useEffect } from "react";

const ContextoTema = createContext(undefined);

export const ProveedorTema = ({ children }) => {
    // Inicializar desde localStorage o usar false como default
    const [esModoOscuro, setEsModoOscuro] = useState(() => {
        const guardado = localStorage.getItem("darkMode");
        if (guardado !== null) {
            return guardado === "true";
        }
        // Si no hay preferencia guardada, verificar si ya existe la clase dark
        return document.documentElement.classList.contains("dark");
    });

    // Aplicar la clase dark al document y guardar en localStorage
    useEffect(() => {
        if (esModoOscuro) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", String(esModoOscuro));
    }, [esModoOscuro]);

    const alternarModoOscuro = () => {
        setEsModoOscuro((previo) => !previo);
    };

    return (
        <ContextoTema.Provider value={{ esModoOscuro, alternarModoOscuro }}>
            {children}
        </ContextoTema.Provider>
    );
};

export const usarTema = () => {
    const contexto = useContext(ContextoTema);
    if (contexto === undefined) {
        throw new Error("usarTema debe usarse dentro de un ProveedorTema");
    }
    return contexto;
};
