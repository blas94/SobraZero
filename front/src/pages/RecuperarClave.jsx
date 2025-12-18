import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Boton } from "@/components/ui/Boton";
import { Entrada } from "@/components/ui/Entrada";
import { Mail, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Formulario,
  ControlFormulario,
  CampoFormulario,
  ItemFormulario,
  EtiquetaFormulario,
  MensajeFormulario,
} from "@/components/ui/Formulario";
import { usarTema } from "@/hooks/usar-tema";

const esquemaRecupero = z.object({
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Máximo 255 caracteres"),
});

import { recuperarClave } from "@/services/autenticacion";

const RecuperarClave = () => {
  const navegar = useNavigate();
  const { esModoOscuro } = usarTema();
  const [enviando, setEnviando] = useState(false);

  const formulario = useForm({
    resolver: zodResolver(esquemaRecupero),
    defaultValues: {
      email: "",
    },
  });

  const manejarEnvio = async (data) => {
    setEnviando(true);
    try {
      await recuperarClave(data.email);
      toast.success(
        "Enviamos un correo con instrucciones para restablecer tu contraseña"
      );
      setTimeout(() => navegar("/autenticacion"), 3000);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Error al enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Boton
          variant="ghost"
          size="sm"
          onClick={() => navegar("/autenticacion")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a iniciar sesión
        </Boton>

        <Tarjeta className="p-6">
          <div className="text-center mb-6">
            <img
              src={esModoOscuro ? logoDark : logo}
              alt="Logo de SobraZero"
              className="w-36 mx-auto my-6"
              loading="eager"
              fetchpriority="high"
            />
            <h1 className="text-2xl font-bold mb-2">Restablecer contraseña</h1>
            <p className="text-sm text-muted-foreground">
              Ingresá tu email y te enviaremos instrucciones para restablecer tu
              contraseña
            </p>
          </div>

          <Formulario {...formulario}>
            <form
              onSubmit={formulario.handleSubmit(manejarEnvio)}
              className="space-y-4"
            >
              <CampoFormulario
                control={formulario.control}
                name="email"
                render={({ field }) => (
                  <ItemFormulario>
                    <EtiquetaFormulario className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </EtiquetaFormulario>
                    <ControlFormulario>
                      <Entrada
                        {...field}
                        type="email"
                        placeholder="tu@email.com"
                      />
                    </ControlFormulario>
                    <MensajeFormulario />
                  </ItemFormulario>
                )}
              />

              <Boton type="submit" className="w-full">
                Enviar instrucciones
              </Boton>
            </form>
          </Formulario>
        </Tarjeta>
      </div>
    </div>
  );
};

export default RecuperarClave;
