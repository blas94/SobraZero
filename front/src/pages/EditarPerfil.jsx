import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Mail, Phone, X } from "lucide-react";
import {
  Formulario,
  ControlFormulario,
  CampoFormulario,
  ItemFormulario,
  EtiquetaFormulario,
  MensajeFormulario,
} from "@/components/ui/Formulario";
import { Avatar, RespaldoAvatar, ImagenAvatar } from "@/components/ui/Avatar";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Boton } from "@/components/ui/Boton";
import { Entrada } from "@/components/ui/Entrada";
import NavegacionInferior from "@/components/NavegacionInferior";
import FormasDecorativas from "@/components/FormasDecorativas";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  Dialogo,
  DisparadorDialogo,
  ContenidoDialogo,
  EncabezadoDialogo,
  TituloDialogo,
  DescripcionDialogo,
} from "@/components/ui/Dialogo";
import { actualizarPerfil, obtenerPerfil, solicitarCambioEmail } from "@/services/autenticacion";

const esquemaPerfil = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Máximo 255 caracteres"),
  phone: z
    .string()
    .trim()
    .min(1, "El teléfono es requerido")
    .max(20, "Máximo 20 caracteres"),
});

const EditarPerfil = () => {
  const navegar = useNavigate();

  const [usuario, setUsuario] = useState(() => {
    const almacenado = localStorage.getItem("user");
    if (almacenado) {
      try {
        const parseado = JSON.parse(almacenado);
        return {
          name: parseado.nombre || parseado.name || "",
          email: parseado.email || "",
          phone: parseado.tel || parseado.phone || "",
          avatar: parseado.avatar || null,
        };
      } catch { }
    }
    return {
      name: "",
      email: "",
      phone: "",
      avatar: null,
    };
  });

  const [urlAvatar, setUrlAvatar] = useState(null);
  const [fotoEliminada, setFotoEliminada] = useState(false);
  const referenciaArchivo = useRef(null);

  const formulario = useForm({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: {
      name: usuario.name,
      email: usuario.email,
      phone: usuario.phone,
    },
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfil();
        const usuarioBackend = data.user || data.usuario || data;

        if (!usuarioBackend) return;

        const datosMapeados = {
          name: usuarioBackend.nombre || usuarioBackend.name || "",
          email: usuarioBackend.email || "",
          phone: usuarioBackend.tel || usuarioBackend.phone || "",
          avatar: usuarioBackend.avatar || null,
        };

        setUsuario(datosMapeados);
        formulario.reset(datosMapeados);

        localStorage.setItem("user", JSON.stringify(usuarioBackend));
      } catch (error) {
        console.error("Error obteniendo perfil:", error);
      }
    };

    cargarPerfil();
  }, [formulario]);

  const manejarClickAvatar = () => {
    referenciaArchivo.current?.click();
  };

  const manejarCambioArchivo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("La imagen no puede superar los 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrlAvatar(reader.result);
        setFotoEliminada(false); // Se está cargando una nueva foto, no es eliminación
        toast.success("Foto cargada (guardá para aplicar cambios)");
      };
      reader.readAsDataURL(file);
    }
  };

  const manejarEliminarFoto = () => {
    setUrlAvatar(null);
    setFotoEliminada(true); // Marcar que se eliminó activamente
    setUsuario(prev => ({ ...prev, avatar: null }));
    toast.success("Foto eliminada (guardá para aplicar cambios)");
  };

  const manejarEnvio = async (data) => {
    try {
      const payload = {
        nombre: data.name,
        // email: data.email, // Email ya no se actualiza por aquí
        tel: data.phone,
      };

      // Solo incluir avatar si hay cambios
      if (fotoEliminada) {
        payload.avatar = null; // Eliminación activa
      } else if (urlAvatar) {
        payload.avatar = urlAvatar; // Nueva foto
      }
      // Si no hay cambios (ni nueva foto ni eliminación), no se incluye avatar

      const respuesta = await actualizarPerfil(payload);
      const usuarioBackend = respuesta.user || respuesta.usuario || respuesta;

      // Usar los datos del backend para actualizar el estado local
      const updated = {
        name: usuarioBackend.nombre || usuarioBackend.name || data.name,
        email: usuarioBackend.email || data.email,
        phone: usuarioBackend.tel || usuarioBackend.phone || data.phone,
        avatar: usuarioBackend.avatar !== undefined ? usuarioBackend.avatar : null,
      };
      setUsuario(updated);

      if (usuarioBackend) {
        localStorage.setItem("user", JSON.stringify(usuarioBackend));
      }

      // Limpiar urlAvatar temporal después de guardar exitosamente
      setUrlAvatar(null);
      setFotoEliminada(false);

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      if (error.response) {
        if (error.response.status === 413) toast.error("La imagen es muy pesada para el servidor");
      }
      toast.error("No se pudo actualizar el perfil");
    }
  };

  const manejarCambioEmail = async (newEmail) => {
    if (!newEmail) return;
    console.log("🔍 Iniciando cambio de email a:", newEmail);
    try {
      const response = await solicitarCambioEmail(newEmail);
      console.log("✅ Respuesta del servidor:", response);
      toast.success(`Se envió un link de confirmación a ${newEmail}`);
    } catch (error) {
      console.error("❌ Error en cambio de email:", error);
      console.error("❌ Error response:", error.response);
      const errorMsg = error.response?.data?.error || error.message || "Error al solicitar cambio de email";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <Boton
            variant="ghost"
            size="icon"
            onClick={() => navegar("/perfil")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Boton>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
        </div>
      </header>

      <main className="px-4 py-4 relative z-10">
        <Tarjeta className="p-6">
          <Formulario {...formulario}>
            <form
              onSubmit={formulario.handleSubmit(manejarEnvio)}
              className="space-y-4"
            >
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-border">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <ImagenAvatar src={urlAvatar || usuario.avatar || undefined} />
                    <RespaldoAvatar className="bg-primary/10 text-primary text-2xl">
                      {usuario.name
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </RespaldoAvatar>
                  </Avatar>
                  <Boton
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-md"
                    onClick={manejarClickAvatar}
                  >
                    <Camera className="w-4 h-4" />
                  </Boton>
                  {(urlAvatar || usuario.avatar) && (
                    <Boton
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute bottom-0 left-0 rounded-full w-8 h-8 shadow-md"
                      onClick={manejarEliminarFoto}
                    >
                      <X className="w-4 h-4" />
                    </Boton>
                  )}
                  <input
                    ref={referenciaArchivo}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={manejarCambioArchivo}
                    aria-label="Cambiar foto de perfil"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Hacé clic en el ícono para cambiar la foto
                </p>
                <p className="text-xs text-muted-foreground">
                  (Se recomienda subir una imagen cuadrada de mismo ancho por alto)
                </p>
              </div>

              <CampoFormulario
                control={formulario.control}
                name="name"
                render={({ field }) => (
                  <ItemFormulario>
                    <EtiquetaFormulario className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Nombre completo
                    </EtiquetaFormulario>
                    <ControlFormulario>
                      <Entrada {...field} />
                    </ControlFormulario>
                    <MensajeFormulario />
                  </ItemFormulario>
                )}
              />

              <CampoFormulario
                control={formulario.control}
                name="email"
                render={({ field }) => (
                  <ItemFormulario>
                    <EtiquetaFormulario className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </EtiquetaFormulario>
                    <div className="flex gap-2">
                      <ControlFormulario>
                        <Entrada {...field} type="email" disabled className="bg-muted text-muted-foreground" />
                      </ControlFormulario>
                      <Dialogo>
                        <DisparadorDialogo asChild>
                          <Boton type="button" variant="outline" size="sm">Cambiar</Boton>
                        </DisparadorDialogo>
                        <ContenidoDialogo>
                          <EncabezadoDialogo>
                            <TituloDialogo>Cambiar Email</TituloDialogo>
                            <DescripcionDialogo>
                              Ingresá tu nueva dirección de correo. Te enviaremos un link de confirmación.
                            </DescripcionDialogo>
                          </EncabezadoDialogo>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const formData = new FormData(e.currentTarget);
                            const newEmail = formData.get("newEmail");
                            manejarCambioEmail(newEmail);
                          }} className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <label htmlFor="newEmail" className="text-sm font-medium">Nuevo Email</label>
                              <Entrada id="newEmail" name="newEmail" type="email" required placeholder="nuevo@email.com" />
                            </div>
                            <Boton type="submit" className="w-full">Enviar link de confirmación</Boton>
                          </form>
                        </ContenidoDialogo>
                      </Dialogo>
                    </div>
                    <MensajeFormulario />
                  </ItemFormulario>
                )}
              />

              <CampoFormulario
                control={formulario.control}
                name="phone"
                render={({ field }) => (
                  <ItemFormulario>
                    <EtiquetaFormulario className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Teléfono
                    </EtiquetaFormulario>
                    <ControlFormulario>
                      <Entrada {...field} />
                    </ControlFormulario>
                    <MensajeFormulario />
                  </ItemFormulario>
                )}
              />



              <Boton type="submit" className="w-full">
                Guardar cambios
              </Boton>
            </form>
          </Formulario>
        </Tarjeta>
      </main>

      <NavegacionInferior />
    </div>
  );
};

export default EditarPerfil;
