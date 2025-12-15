import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContenidoComercio from "@/components/ContenidoComercio";
import NavegacionInferior from "@/components/NavegacionInferior";
import {
  comercios as comerciosBase,
} from "@/data/datos-comercios";

const DetalleComercio = () => {
  const { id } = useParams();

  const [comerciosLocales, setComerciosLocales] = useState(() => {
    const guardados = localStorage.getItem("estadoComercios");
    if (guardados) {
      try {
        return JSON.parse(guardados);
      } catch {
        return comerciosBase;
      }
    }
    return comerciosBase;
  });

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

        localStorage.setItem("estadoComercios", JSON.stringify(nuevoEstado));

        return nuevoEstado;
      });
    };

    window.addEventListener("comercioReservado", manejarComercioReservado);

    return () =>
      window.removeEventListener("comercioReservado", manejarComercioReservado);
  }, []);

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
