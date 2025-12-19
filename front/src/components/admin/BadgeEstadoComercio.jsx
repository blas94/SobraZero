// Componente Badge para mostrar el estado de aprobación del comercio
const BadgeEstadoComercio = ({ estado }) => {
    const estadoNormalizado = (estado || "pendiente").toLowerCase();

    const estilos = {
        pendiente: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
        aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
        rechazado: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800"
    };

    const textos = {
        pendiente: "Pendiente",
        aprobado: "Aprobado",
        rechazado: "Rechazado"
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border shadow-sm ${estilos[estadoNormalizado] || estilos.pendiente}`}>
            {textos[estadoNormalizado] || "Pendiente"}
        </span>
    );
};

export default BadgeEstadoComercio;
