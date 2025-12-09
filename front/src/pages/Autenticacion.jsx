import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Pestañas, ContenidoPestañas, ListaPestañas, ActivadorPestañas } from "@/components/ui/Pestañas";
import logo from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import { usarTema } from "@/hooks/usar-tema";
import IniciarSesion from "@/components/autenticacion/IniciarSesion";
import Registrarse from "@/components/autenticacion/Registrarse";
import { useAuth } from "@/context/AuthContext";
import { PantallaCarga } from "@/components/ui/PantallaCarga";

const Autenticacion = () => {
  const [pestanaActiva, setPestanaActiva] = useState("inicio");
  const { esModoOscuro } = usarTema();
  const { usuario, cargando } = useAuth();

  // 1. Si está cargando, mostramos spinner (evita flash de form vacío)
  if (cargando) {
    return <PantallaCarga texto="Verificando sesión..." />;
  }

  // 2. Si hay usuario, redirigimos INMEDIATAMENTE (render time)
  // Esto evita que React "pinte" el formulario y luego el useEffect lo saque, causando el parpadeo.
  if (usuario) {
    return <Navigate to="/inicio" replace />;
  }

  // 3. Si no carga y no hay usuario, mostramos el login normalmente
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <Tarjeta className="w-full max-w-md p-6 shadow-xl border-border/50 bg-card/50 backdrop-blur-sm relative z-10">
          <div className="text-center mb-6">
            <h1 className="sr-only">Autenticación - SobraZero</h1>
            <img
              src={esModoOscuro ? logoDark : logo}
              alt="Logo de SobraZero"
              className="w-36 mx-auto my-6"
              loading="eager"
              fetchpriority="high"
            />
            <p className="text-lg font-semibold text-primary italic">
              Salvá comida, ahorrá dinero
            </p>
          </div>

          <Pestañas value={pestanaActiva} onValueChange={setPestanaActiva}>
            <ListaPestañas className="grid w-full grid-cols-2 mb-6">
              <ActivadorPestañas value="inicio">Iniciar sesión</ActivadorPestañas>
              <ActivadorPestañas value="registro">Registrarse</ActivadorPestañas>
            </ListaPestañas>

            <ContenidoPestañas value="inicio">
              <IniciarSesion onCambiarPestana={setPestanaActiva} />
            </ContenidoPestañas>

            <ContenidoPestañas value="registro">
              <Registrarse onCambiarPestana={setPestanaActiva} />
            </ContenidoPestañas>
          </Pestañas>
        </Tarjeta>
      </div>
    </div>
  );
};

export default Autenticacion;
