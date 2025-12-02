import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RutaProtegida = ({ children }) => {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [checandoAutenticacion, setChecandoAutenticacion] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAutenticado(false);
      setChecandoAutenticacion(false);
      navegar("/autenticacion", {
        replace: true,
        state: { from: ubicacion.pathname },
      });
    } else {
      setAutenticado(true);
      setChecandoAutenticacion(false);
    }
  }, [navegar, ubicacion.pathname]);

  if (checandoAutenticacion) return null;
  if (!autenticado) return null;

  return <>{children}</>;
};

export default RutaProtegida;
