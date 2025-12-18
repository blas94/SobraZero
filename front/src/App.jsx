import React from "react";
import { Notificador } from "@/components/ui/Notificador";
import { Avisador as Sonner } from "@/components/ui/Avisador";
import InstalarAndroid from "@/components/InstalarAndroid";
import InstalarIOS from "@/components/InstalarIOS";
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
import { ControladorTutorial } from "@/components/ControladorTutorial";
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
import RegistrarComercio from "./pages/RegistrarComercio";
import EditarComercio from "./pages/EditarComercio";
import RecuperarPassword from "./pages/RecuperarPassword";
import RestablecerPassword from "./pages/RestablecerPassword";
import VerificarCambioEmail from "./pages/VerificarCambioEmail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import { PantallaCarga } from "@/components/ui/PantallaCarga";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-red-50 text-red-900">
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border border-red-200">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Algo salió mal
            </h2>
            <p className="mb-4 text-sm">
              La aplicación ha encontrado un error inesperado.
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-auto max-h-48">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <PantallaCarga texto="Verificando sesión..." />;
  if (!usuario) return <Navigate to="/autenticacion" replace />;

  return children;
}

function RutaAdmin({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <PantallaCarga texto="Verificando sesión..." />;
  if (!usuario) return <Navigate to="/autenticacion" replace />;
  if (usuario.rol !== "admin") return <Navigate to="/inicio" replace />;
  return children;
}

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProveedorTema>
            <ProveedorGloboInformacion>
              <Notificador />
              <Sonner />
              <InstalarAndroid />
              <InstalarIOS />
              <BrowserRouter>
                <ControladorTutorial />
                <ScrollToTop />
                <Routes>
                  <Route path="/autenticacion" element={<Autenticacion />} />
                  <Route
                    path="/recuperar-clave"
                    element={<RecuperarPassword />}
                  />
                  <Route
                    path="/restablecer-password"
                    element={<RestablecerPassword />}
                  />
                  <Route
                    path="/verificar-cambio-email"
                    element={<VerificarCambioEmail />}
                  />
                  <Route path="/pagos/estado" element={<EstadoPago />} />
                  <Route
                    path="/"
                    element={<Navigate to="/autenticacion" replace />}
                  />
                  <Route
                    path="/admin"
                    element={
                      <RutaAdmin>
                        <AdminDashboard />
                      </RutaAdmin>
                    }
                  />

                  <Route
                    path="/admin/usuarios"
                    element={
                      <RutaAdmin>
                        <AdminUsuarios />
                      </RutaAdmin>
                    }
                  />

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
                        <RegistrarComercio />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/perfil/editar-comercio"
                    element={
                      <RutaProtegida>
                        <EditarComercio />
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
    </ErrorBoundary>
  );
};

export default App;