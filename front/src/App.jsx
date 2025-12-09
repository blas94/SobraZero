import { Notificador } from "@/components/ui/Notificador";
import { Avisador as Sonner } from "@/components/ui/Avisador";
import { ProveedorGloboInformacion } from "@/components/ui/GloboInformacion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { ProveedorTema } from "@/hooks/usar-tema";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Inicio from "./pages/Inicio";
import DetalleComercio from "./pages/DetalleComercio";
import Pedidos from "./pages/Pedidos";
import Perfil from "./pages/Perfil";
import Favoritos from "./pages/Favoritos";
import Configuracion from "./pages/Configuracion";
import Notificaciones from "./pages/Notificaciones";
import CentroAyuda from "./pages/CentroAyuda";
import ChatEnVivo from "./pages/ChatEnVivo";
import Autenticacion from "./pages/Autenticacion";
import NotFound from "./pages/NotFound";
import EstadoPago from "./pages/EstadoPago";
import EditarPerfil from "./pages/EditarPerfil";
import RegistrarTienda from "./pages/RegistrarTienda";
import RecuperarPassword from "./pages/RecuperarPassword";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};


function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <div className="h-screen flex items-center justify-center bg-background">Cargando...</div>;
  if (!usuario) return <Navigate to="/autenticacion" replace />;

  return children;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProveedorTema>
          <ProveedorGloboInformacion>
            <Notificador />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/autenticacion" element={<Autenticacion />} />
                <Route path="/recuperar-password" element={<RecuperarPassword />} />
                <Route path="/pagos/estado" element={<EstadoPago />} />

                <Route path="/" element={<Navigate to="/autenticacion" replace />} />

                <Route
                  path="/inicio"
                  element={
                    <RutaProtegida>
                      <Inicio />
                    </RutaProtegida>
                  }
                />

                <Route
                  path="/comercio/:id"
                  element={
                    <RutaProtegida>
                      <DetalleComercio />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/pedidos"
                  element={
                    <RutaProtegida>
                      <Pedidos />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/favoritos"
                  element={
                    <RutaProtegida>
                      <Favoritos />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <RutaProtegida>
                      <Perfil />
                    </RutaProtegida>
                  }
                />

                <Route
                  path="/perfil/editar"
                  element={
                    <RutaProtegida>
                      <EditarPerfil />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/perfil/registrar-comercio"
                  element={
                    <RutaProtegida>
                      <RegistrarTienda />
                    </RutaProtegida>
                  }
                />

                <Route
                  path="/perfil/configuracion"
                  element={
                    <RutaProtegida>
                      <Configuracion />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/perfil/notificaciones"
                  element={
                    <RutaProtegida>
                      <Notificaciones />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/perfil/centro-ayuda"
                  element={
                    <RutaProtegida>
                      <CentroAyuda />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/perfil/centro-ayuda/chat"
                  element={
                    <RutaProtegida>
                      <ChatEnVivo />
                    </RutaProtegida>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ProveedorGloboInformacion>
        </ProveedorTema>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
