import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Mail, Phone, MapPin } from "lucide-react";
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
import { actualizarPerfil, obtenerPerfil } from "@/services/autenticacion";

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
  address: z
    .string()
    .trim()
    .min(1, "La dirección es requerida")
    .max(200, "Máximo 200 caracteres"),
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
          address: parseado.ubicacion || parseado.address || "",
        };
      } catch { }
    }
    return {
      name: "",
      email: "",
      phone: "",
      address: "",
    };
  });

  const [urlAvatar, setUrlAvatar] = useState(null);
  const referenciaArchivo = useRef(null);

  const formulario = useForm({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: {
      name: usuario.name,
      email: usuario.email,
      phone: usuario.phone,
      address: usuario.address,
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
          address: usuarioBackend.ubicacion || usuarioBackend.address || "",
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no puede superar los 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrlAvatar(reader.result);
        toast.success("Foto actualizada (solo en este dispositivo)");
      };
      reader.readAsDataURL(file);
    }
  };

  const manejarEnvio = async (data) => {
    try {
      const payload = {
        nombre: data.name,
        email: data.email,
        tel: data.phone,
        ubicacion: data.address,
      };

      const respuesta = await actualizarPerfil(payload);
      const usuarioBackend = respuesta.user || respuesta.usuario || respuesta;

      const updated = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      };
      setUsuario(updated);

      if (usuarioBackend) {
        localStorage.setItem("user", JSON.stringify(usuarioBackend));
      }

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      toast.error("No se pudo actualizar el perfil");
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
                    <ImagenAvatar src={urlAvatar || undefined} />
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
                  Hacé clic en el ícono para cambiar la foto (solo local)
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
                    <ControlFormulario>
                      <Entrada {...field} type="email" />
                    </ControlFormulario>
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

              <CampoFormulario
                control={formulario.control}
                name="address"
                render={({ field }) => (
                  <ItemFormulario>
                    <EtiquetaFormulario className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Dirección
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
