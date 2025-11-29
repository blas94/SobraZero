import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock4, ShieldCheck, Send } from "lucide-react";
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from "@/components/ui/tarjeta";
import { Boton } from "@/components/ui/boton";
import { AreaTexto } from "@/components/ui/area-texto";
import FormasDecorativas from "@/components/FormasDecorativas";
import { useNavigate } from "react-router-dom";

const mensajesIniciales = [
  {
    id: "1",
    autor: "soporte",
    texto: "Hola, somos el equipo de SobraZero. ¿Cómo podemos ayudarte hoy?",
    hora: "09:00",
  },
  {
    id: "2",
    autor: "usuario",
    texto: "Necesito confirmar mi reserva para esta tarde.",
    hora: "09:01",
  },
  {
    id: "3",
    autor: "soporte",
    texto:
      "Listo, tu reserva sigue activa para las 19:00. Avísanos si tenés otro pedido.",
    hora: "09:02",
  },
];

const ChatEnVivo = () => {
  const navegar = useNavigate();
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [mensajeEntrada, setMensajeEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finChatRef = useRef(null);

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const obtenerHoraActual = () => {
    const ahora = new Date();
    return ahora
      .toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      .replace(".", ":");
  };

  const manejarEnviarMensaje = (evento) => {
    evento.preventDefault();
    const texto = mensajeEntrada.trim();

    if (!texto) {
      return;
    }

    const mensajeUsuario = {
      id: Date.now().toString(),
      autor: "usuario",
      texto,
      hora: obtenerHoraActual(),
    };

    setMensajes((prev) => [...prev, mensajeUsuario]);
    setMensajeEntrada("");
    setEnviando(true);

    setTimeout(() => {
      const respuestaAutomatica = {
        id: `${Date.now()}-respuesta`,
        autor: "soporte",
        texto:
          "Gracias por escribirnos. Un agente real tomará la conversación en los próximos minutos.",
        hora: obtenerHoraActual(),
      };
      setMensajes((prev) => [...prev, respuestaAutomatica]);
      setEnviando(false);
    }, 1000);
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
            <h1 className="text-2xl font-bold">Chat en vivo</h1>
            <p className="text-sm text-muted-foreground">
              Estamos respondiendo consultas por orden de llegada
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        <Tarjeta>
          <EncabezadoTarjeta className="pb-2">
            <TituloTarjeta className="text-base">Estado de la sala</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock4 className="w-4 h-4 text-primary" />
              Tiempo estimado de respuesta menor a 5 minutos
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              El chat queda registrado para tu seguridad
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta className="h-[55vh] flex flex-col">
          <ContenidoTarjeta className="flex-1 overflow-y-auto space-y-3 pt-6">
            {mensajes.map((mensaje) => {
              const esUsuario = mensaje.autor === "usuario";
              return (
                <div
                  key={mensaje.id}
                  className={`flex ${esUsuario ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${esUsuario
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                      }`}
                  >
                    <p className="text-sm leading-relaxed">{mensaje.texto}</p>
                    <span className="text-[11px] block mt-1 opacity-80">
                      {esUsuario ? "Vos" : "Equipo SobraZero"} - {mensaje.hora}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={finChatRef} />
          </ContenidoTarjeta>

          <form
            onSubmit={manejarEnviarMensaje}
            className="p-4 border-t border-border space-y-3"
          >
            <AreaTexto
              placeholder="Escribí tu mensaje..."
              value={mensajeEntrada}
              onChange={(event) => setMensajeEntrada(event.target.value)}
              className="min-h-[80px]"
            />
            <Boton type="submit" className="w-full" disabled={enviando}>
              <Send className="w-4 h-4 mr-2" />
              {enviando ? "Enviando..." : "Enviar mensaje"}
            </Boton>
          </form>
        </Tarjeta>
      </main>
    </div>
  );
};

export default ChatEnVivo;
