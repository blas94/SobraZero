import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  BookOpen,
} from "lucide-react";
import FormasDecorativas from "@/components/FormasDecorativas";
import {
  Tarjeta,
  ContenidoTarjeta,
  DescripcionTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
} from "@/components/ui/tarjeta";
import { Boton } from "@/components/ui/boton";
import { AreaTexto } from "@/components/ui/area-texto";
import { Etiqueta } from "@/components/ui/etiqueta";
import {
  Acordeon,
  ContenidoAcordeon,
  ItemAcordeon,
  ActivadorAcordeon,
} from "@/components/ui/acordeon";

const esquemaFeedback = z.object({
  feedback: z
    .string()
    .trim()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "Máximo 1000 caracteres"),
});

const preguntasFrecuentes = [
  {
    pregunta: "¿Cómo funciona la app?",
    respuesta:
      "Conectamos comercios locales con personas que quieren evitar el desperdicio. Cada comercio publica bolsas sorpresa con excedente del día y podés reservarlas desde la app.",
  },
  {
    pregunta: "¿Cómo reservo un pack?",
    respuesta:
      "Elegís un comercio, confirmás la reserva y pagás desde la app. Después solo tenés que pasar por el local en el horario indicado para retirar tu bolsa.",
  },
  {
    pregunta: "¿Puedo cancelar mi reserva?",
    respuesta:
      "Sí, podés cancelar sin costo hasta dos horas antes del horario de retiro. Luego de ese plazo el comercio ya preparó tu pack y no podremos reembolsarlo.",
  },
  {
    pregunta: "¿Qué pasa si llego tarde?",
    respuesta:
      "Los comercios guardan tu reserva hasta el final de la ventana horaria. Pasado ese tiempo pueden donar el pack y no podremos garantizar la devolución.",
  },
  {
    pregunta: "¿Los packs son siempre distintos?",
    respuesta:
      "Sí, dependen del excedente del día. Esa sorpresa hace que cada pedido sea único y ayuda a que nada se desperdicie.",
  },
  {
    pregunta: "¿Qué hago si algo salió mal?",
    respuesta:
      "Escribinos desde el chat o por mail con el número de pedido. Respondemos la mayoría de los reclamos en menos de dos horas.",
  },
];

const recursosAdicionales = [
  {
    titulo: "Guía rápida",
    contenido:
      "Mirá un resumen paso a paso para publicar un comercio, reservar bolsas y compartir tus reseñas. Disponible en la sección de tutoriales dentro de la app.",
  },
  {
    titulo: "Términos y condiciones",
    contenido:
      "Al usar SobraZero aceptás nuestras políticas de uso responsable, cancelación y devolución. Leé el documento actualizado antes de operar.",
  },
  {
    titulo: "Política de privacidad",
    contenido:
      "Protegemos tu información con cifrado y solo la compartimos con proveedores esenciales. Podés solicitar la eliminación de tus datos cuando quieras.",
  },
];

const CentroAyuda = () => {
  const navegar = useNavigate();
  const [comentario, setComentario] = useState("");
  const [errorComentario, setErrorComentario] = useState("");

  const opcionesContacto = [
    {
      icono: MessageCircle,
      titulo: "Chat en vivo",
      descripcion: "Respuesta en minutos",
      accion: () => navegar("/perfil/centro-ayuda/chat"),
    },
    {
      icono: Mail,
      titulo: "Email",
      descripcion: "soporte@sobrazero.com",
      accion: () =>
      (window.location.href =
        "mailto:soporte@sobrazero.com?subject=Consulta%20desde%20SobraZero&body=Hola%20SobraZero,%20necesito%20ayuda%20con..."),
    },
  ];

  const manejarEnvioFeedback = () => {
    try {
      esquemaFeedback.parse({ feedback: comentario });
      toast.success("¡Gracias por tus comentarios!");
      setComentario("");
      setErrorComentario("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrorComentario(error.errors[0].message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navegar(-1)}
            className="hover:bg-muted rounded-full p-1 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Centro de ayuda</h1>
<<<<<<< HEAD
=======
            <p className="text-sm text-muted-foreground">
              Encontramos soluciones rápidas para vos y tu comercio
            </p>
>>>>>>> c4485221984c1b59f330c839a806751c19be7cd7
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 relative z-10">
        <Tarjeta>
          <EncabezadoTarjeta className="pb-2">
<<<<<<< HEAD
            <h2 className="text-base font-semibold leading-none tracking-tight">
              ¿Cómo podemos ayudarte?
            </h2>
=======
            <TituloTarjeta className="text-base">¿Cómo podemos ayudarte?</TituloTarjeta>
>>>>>>> c4485221984c1b59f330c839a806751c19be7cd7
            <DescripcionTarjeta>
              Explorá preguntas frecuentes, escribinos o dejá un comentario.
            </DescripcionTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="grid gap-4 md:grid-cols-2">
            {opcionesContacto.map((opcion, index) => {
              const Icono = opcion.icono;
              return (
                <Tarjeta
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={opcion.accion}
                >
                  <EncabezadoTarjeta className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icono className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <TituloTarjeta className="text-base">
                          {opcion.titulo}
                        </TituloTarjeta>
                        <DescripcionTarjeta className="text-sm">
                          {opcion.descripcion}
                        </DescripcionTarjeta>
                      </div>
                    </div>
                  </EncabezadoTarjeta>
                </Tarjeta>
              );
            })}
          </ContenidoTarjeta>
        </Tarjeta>

        <div>
<<<<<<< HEAD
          <h3 className="font-semibold mb-3 px-1 flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5" />
            Preguntas frecuentes
          </h3>
=======
          <h2 className="font-semibold mb-3 px-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Preguntas frecuentes
          </h2>
>>>>>>> c4485221984c1b59f330c839a806751c19be7cd7
          <Tarjeta>
            <Acordeon type="single" collapsible className="w-full">
              {preguntasFrecuentes.map((item, index) => (
                <ItemAcordeon key={index} value={`pregunta-${index}`}>
                  <ActivadorAcordeon className="px-4 text-left">
<<<<<<< HEAD
                    <h4 className="text-sm font-medium">{item.pregunta}</h4>
=======
                    {item.pregunta}
>>>>>>> c4485221984c1b59f330c839a806751c19be7cd7
                  </ActivadorAcordeon>
                  <ContenidoAcordeon className="px-4 text-muted-foreground">
                    {item.respuesta}
                  </ContenidoAcordeon>
                </ItemAcordeon>
              ))}
            </Acordeon>
          </Tarjeta>
        </div>

        <div>
<<<<<<< HEAD
          <h3 className="font-semibold mb-3 px-1 flex items-center gap-2 text-lg">
            <HelpCircle className="w-5 h-5" />
            Recursos adicionales
          </h3>
=======
          <h2 className="font-semibold mb-3 px-1 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Recursos adicionales
          </h2>
>>>>>>> c4485221984c1b59f330c839a806751c19be7cd7
          <Tarjeta>
            <Acordeon type="single" collapsible className="w-full">
              {recursosAdicionales.map((recurso, index) => (
                <ItemAcordeon key={index} value={`recurso-${index}`}>
                  <ActivadorAcordeon className="px-4 text-left">
<<<<<<< HEAD
                    <h4 className="text-sm font-medium">{recurso.titulo}</h4>
=======
                    {recurso.titulo}
>>>>>>> c4485221984c1b59f330c839a806751c19be7cd7
                  </ActivadorAcordeon>
                  <ContenidoAcordeon className="px-4 text-muted-foreground">
                    {recurso.contenido}
                  </ContenidoAcordeon>
                </ItemAcordeon>
              ))}
            </Acordeon>
          </Tarjeta>
        </div>

        <Tarjeta className="p-4">
          <h3 className="font-semibold mb-2 text-center">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Contanos qué podemos mejorar en el centro de ayuda
          </p>
          <div className="space-y-3">
            <div>
              <Etiqueta htmlFor="feedback">Tu comentario</Etiqueta>
              <AreaTexto
                id="feedback"
                placeholder="Escribí tu sugerencia acá..."
                value={comentario}
                onChange={(event) => {
                  setComentario(event.target.value);
                  setErrorComentario("");
                }}
                className="mt-1 min-h-[100px]"
              />
              {errorComentario && (
                <p className="text-sm text-destructive mt-1">
                  {errorComentario}
                </p>
              )}
            </div>
            <Boton onClick={manejarEnvioFeedback} className="w-full">
              Enviar comentarios
            </Boton>
          </div>
        </Tarjeta>
      </main>
    </div>
  );
};

export default CentroAyuda;
