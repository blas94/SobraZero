import { NavLink } from "react-router-dom";

const linkBase =
    "px-4 py-2 rounded text-sm font-medium transition-colors";
const activo =
    "bg-primary text-white";
const inactivo =
    "text-muted-foreground hover:text-white hover:bg-muted";

export default function AdminNav() {
    return (
        <nav className="mb-6 flex gap-2 flex-wrap">
            <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                    `${linkBase} ${isActive ? activo : inactivo}`
                }
            >
                Dashboard
            </NavLink>

            <NavLink
                to="/admin/usuarios"
                className={({ isActive }) =>
                    `${linkBase} ${isActive ? activo : inactivo}`
                }
            >
                Usuarios
            </NavLink>

            <NavLink
                to="/admin/comercios"
                className={({ isActive }) =>
                    `${linkBase} ${isActive ? activo : inactivo}`
                }
            >
                Comercios
            </NavLink>
        </nav>
    );
}
