import { Heart } from "lucide-react";
import { Tarjeta } from "@/components/ui/tarjeta";
import TarjetaComercio from "@/components/TarjetaComercio";
import NavegacionInferior from "@/components/NavegacionInferior";
import FormasDecorativas from "@/components/FormasDecorativas";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { comercios as comerciosMock } from "@/data/datos-comercios";

const Favoritos = () => {
  const navegar = useNavigate();

  const [comerciosFavoritos, setComerciosFavoritos] = useState([]);

  const cargarFavoritos = () => {
    const favoritos = localStorage.getItem("favoritos");
    if (!favoritos) return;
    const idsFavoritos = JSON.parse(favoritos);
    const comercios = comerciosMock.filter((comercio) =>
      idsFavoritos.includes(comercio.id)
    );
    setComerciosFavoritos(comercios);
  };

  useEffect(() => {
    cargarFavoritos();

    const manejarReserva = (evento) => {
      const { idComercio, nuevoDisponible } = evento.detail;
      setComerciosFavoritos((previos) =>
        previos.map((comercio) =>
          comercio.id === idComercio
            ? { ...comercio, disponibles: nuevoDisponible }
            : comercio
        )
      );
    };

    window.addEventListener("comercioReservado", manejarReserva);
    return () =>
      window.removeEventListener("comercioReservado", manejarReserva);
  }, []);

  const manejarQuitarFavorito = (idComercio, evento) => {
    evento.stopPropagation();
    setComerciosFavoritos((previos) =>
      previos.filter((comercio) => comercio.id !== idComercio)
    );

    const favoritos = localStorage.getItem("favoritos");
    if (favoritos) {
      const listaActualizada = JSON.parse(favoritos).filter(
        (idFavorito) => idFavorito !== idComercio
      );
      localStorage.setItem("favoritos", JSON.stringify(listaActualizada));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <FormasDecorativas />
      <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Comercios Favoritos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {comerciosFavoritos.length} comercios guardados
          </p>
        </div>
      </header>

      <main className="px-4 py-4 space-y-3 relative z-10">
        {comerciosFavoritos.length === 0 ? (
          <Tarjeta className="p-8 text-center">
            <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No hay favoritos aún</h3>
            <p className="text-sm text-muted-foreground">
              Tocá el ícono de corazón en cualquier comercio para guardarlo aquí
            </p>
          </Tarjeta>
        ) : (
          comerciosFavoritos.map((comercio) => (
            <TarjetaComercio
              key={comercio.id}
              {...comercio}
              onClick={() => navegar(`/comercio/${comercio.id}`)}
              esFavorito
              alAlternarFavorito={(e) => manejarQuitarFavorito(comercio.id, e)}
              usarIconoCruz={true}
            />
          ))
        )}
      </main>

      <NavegacionInferior />
    </div>
  );
};

export default Favoritos;
