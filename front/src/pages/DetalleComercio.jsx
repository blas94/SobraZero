import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContenidoComercio from "@/components/ContenidoComercio";
import NavegacionInferior from "@/components/NavegacionInferior";
import { toast } from "sonner";

const DetalleComercio = () => {
  const { id } = useParams();
  const [comerciosLocales, setComerciosLocales] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarComercios = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comercios`);

        if (!response.ok) {
          throw new Error("Error al cargar comercios");
        }

        const data = await response.json();

        // Transformar datos para compatibilidad
        const comerciosTransformados = data.map((c) => ({
          ...c,
          id: c._id,
          categoria: c.rubro,
          latitud: c.coordenadas?.lat || 0,
          longitud: c.coordenadas?.lng || 0,
          calificacion: c.calificacionPromedio || 0,
        }));

        setComerciosLocales(comerciosTransformados);
      } catch (error) {
        console.error("Error cargando comercios:", error);
        toast.error("Error al cargar comercios");
      } finally {
        setCargando(false);
      }
    };

    cargarComercios();
  }, []);

  useEffect(() => {
    const manejarComercioReservado = (evento) => {
      const { idComercio, nuevoDisponible, productosActualizados } =
        evento.detail;

      setComerciosLocales((previo) => {
        const nuevoEstado = previo.map((comercio) =>
          comercio.id === idComercio
            ? {
              ...comercio,
              disponibles:
                typeof nuevoDisponible === "number"
                  ? nuevoDisponible
                  : comercio.disponibles,
              productos: productosActualizados ?? comercio.productos,
            }
            : comercio
        );

        return nuevoEstado;
      });
    };

    window.addEventListener("comercioReservado", manejarComercioReservado);

    return () =>
      window.removeEventListener("comercioReservado", manejarComercioReservado);
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Comercio no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <ContenidoComercio
        idComercio={id}
        comercios={comerciosLocales}
        mostrarBotonVolver={true}
      />
      <NavegacionInferior />
    </div>
  );
};

export default DetalleComercio;
