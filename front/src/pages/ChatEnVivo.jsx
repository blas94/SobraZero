import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, MessageCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Boton } from "@/components/ui/Boton";
import FormasDecorativas from "@/components/FormasDecorativas";
import { useNavigate } from "react-router-dom";

// Definición de flujos del chatbot
const FLUJOS = {
  inicio: {
    mensaje: "¡Hola! Soy el asistente virtual de SobraZero. ¿En qué puedo ayudarte hoy?",
    opciones: [
      { texto: "¿Cómo funciona la app?", siguiente: "faq_funciona" },
      { texto: "¿Cómo reservo un producto?", siguiente: "faq_reserva" },
      { texto: "¿Puedo cancelar una reserva?", siguiente: "faq_cancelar_general" },
      { texto: "Problema con un pedido", siguiente: "pedidos" },
      { texto: "Pagos y reembolsos", siguiente: "pagos" },
      { texto: "Horarios de retiro", siguiente: "horarios" },
    ],
  },
  faq_funciona: {
    mensaje: "Conectamos comercios con personas para evitar desperdicio. Los comercios publican sus productos del día, vos las reservas a precio reducido y lo retiras por el local.",
    opciones: [
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  faq_reserva: {
    mensaje: "Seleccionás un comercio cercano, eligís los productos que quieras y reservás desde la app. Solo tenés que ir al local en el horario indicado para retirar tu producto.",
    opciones: [
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  faq_cancelar_general: {
    mensaje: "Los pedidos confirmados no se pueden cancelar. Solo se reembolsa si el comercio no puede cumplir.",
    opciones: [
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },

  pedidos: {
    mensaje: "Entiendo. ¿Cuál es el inconveniente con tu pedido?",
    opciones: [
      { texto: "Fuí y estaba cerrado", siguiente: "comercio_cerrado" },
      { texto: "No tenían mi pedido", siguiente: "sin_stock" },
      { texto: "Tuve un problema con la comida", siguiente: "calidad" },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  pagos: {
    mensaje: "Gestionamos todos los pagos a través de Mercado Pago para tu seguridad.",
    opciones: [
      { texto: "¿Cómo pido un reembolso?", siguiente: "rem" },
      { texto: "Me cobraron dos veces", siguiente: "contacto" },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  horarios: {
    mensaje: "Los horarios de retiro los define cada comercio. Revisa la ficha del comercio antes de comprar.",
    opciones: [
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  comercio_cerrado: {
    mensaje: "Si fuiste dentro del horario y estaba cerrado, repórtalo para que te devolvamos el dinero.",
    opciones: [
      { texto: "Sí, fui en horario", siguiente: "contacto" },
      { texto: "Llegué tarde", siguiente: "tarde_info" },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  sin_stock: {
    mensaje: "¡Te pedimos mil disculpas! Esto no debería pasar. Por favor, confirma que tenías tu reserva activa.",
    opciones: [
      { texto: "Sí, mostré la reserva", siguiente: "contacto" },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  calidad: {
    mensaje: "La seguridad alimentaria es clave. Si el producto estaba en mal estado, por favor contáctanos con una foto.",
    opciones: [
      { texto: "Reportar mala calidad", siguiente: "contacto" },
      { texto: "Se equivocaron de pedido", siguiente: "devolver_dinero" },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },

  devolver_dinero: {
    mensaje: "Uh lamentamos lo sucedido, nos contactaremos con el comercio para resolver el problema. En la siguientes horas le devolveremos el dinero.",
    opciones: [
      { texto: "Gracias, entendido", siguiente: "fin" },
      { texto: "Deseo hablar con un humano", siguiente: "contacto" },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  tarde_info: {
    mensaje: "Lo sentimos. Como son alimentos perecederos, si no retiras a tiempo el comercio puede donar el producto. No podemos ofrecer reembolso en este caso.",
    opciones: [
      { texto: "Volver al inicio", siguiente: "inicio" },
      { texto: "Hablar con soporte", siguiente: "contacto" },
    ],
  },
  fin: {
    mensaje: "¡Me alegra haber ayudado! Si necesitas algo más, aquí estaré.",
    opciones: [
      { texto: "Hacer otra consulta", siguiente: "inicio" },
    ],
  },

  rem: {
    mensaje: "No podemos ofrecer reembolsos sin antes evaluar tu caso. Por favor, contáctanos para que podamos ayudarte.",
    opciones: [
      { texto: "Hablar con soporte", siguiente: "contacto" },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },

  contacto: {
    mensaje: "Parece que necesitas ayuda personalizada. Haz clic abajo para chatear con nuestro equipo de soporte por WhatsApp.",
    esFinal: true,
    accion: "whatsapp",
  },

};

const ChatEnVivo = () => {
  const navegar = useNavigate();
  const { usuario, cargando: cargandoUsuario } = useAuth();

  // Claves dinámicas para localStorage segun el usuario logueado
  // Si no hay usuario (null), usamos 'invitado'
  const userId = usuario?._id || usuario?.id || "invitado";
  const KEY_MENSAJES = `chat_mensajes_${userId}`;
  const KEY_OPCIONES = `chat_opciones_${userId}`;

  const [mensajes, setMensajes] = useState([]);
  const [opcionesActuales, setOpcionesActuales] = useState([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const finChatRef = useRef(null);
  const [chatIniciado, setChatIniciado] = useState(false);

  // 1. Efecto para Cargar historial al iniciar o cambiar de usuario
  useEffect(() => {
    if (cargandoUsuario) return;

    const msjGuardados = localStorage.getItem(KEY_MENSAJES);
    const opcGuardadas = localStorage.getItem(KEY_OPCIONES);

    if (msjGuardados) {
      setMensajes(JSON.parse(msjGuardados));
      setOpcionesActuales(opcGuardadas ? JSON.parse(opcGuardadas) : []);
      setChatIniciado(true);
    } else {
      // Si no hay historial, iniciar chat limpio
      setMensajes([]);
      setOpcionesActuales([]);
      // Agregar mensaje inicial solo si no se ha iniciado ya en esta sesión de memoria
      agregarRespuestaBot("inicio");
      setChatIniciado(true);
    }
  }, [userId, cargandoUsuario]);

  // 2. Efecto para Guardar en localStorage cada vez que cambia el estado
  useEffect(() => {
    if (!chatIniciado) return; // No guardar si aún no cargamos
    localStorage.setItem(KEY_MENSAJES, JSON.stringify(mensajes));
    localStorage.setItem(KEY_OPCIONES, JSON.stringify(opcionesActuales));
  }, [mensajes, opcionesActuales, userId, chatIniciado]);

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, escribiendo]);

  // Mostrar loading mientras verificamos usuario
  if (cargandoUsuario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const obtenerHoraActual = () => {
    return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  const agregarRespuestaBot = (claveFlujo) => {
    setEscribiendo(true);
    setOpcionesActuales([]); // Limpiar opciones mientras escribe

    setTimeout(() => {
      const datosFlujo = FLUJOS[claveFlujo];

      const nuevoMensaje = {
        id: Date.now().toString(),
        autor: "bot",
        texto: datosFlujo.mensaje,
        hora: obtenerHoraActual(),
        esFinal: datosFlujo.esFinal,
        accion: datosFlujo.accion,
      };

      setMensajes((prev) => [...prev, nuevoMensaje]);
      setOpcionesActuales(datosFlujo.opciones || []);
      setEscribiendo(false);
    }, 1000); // Simular "escribiendo..."
  };

  const manejarOpcionClick = (opcion) => {
    // Agregar selección del usuario como mensaje
    const mensajeUsuario = {
      id: Date.now().toString(),
      autor: "usuario",
      texto: opcion.texto,
      hora: obtenerHoraActual(),
    };

    setMensajes((prev) => [...prev, mensajeUsuario]);

    // Disparar respuesta del bot
    agregarRespuestaBot(opcion.siguiente);
  };

  const abrirWhatsapp = () => {
    window.open("https://wa.me/541156180707", "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-10 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navegar(-1)}
            className="hover:bg-muted rounded-full p-1 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Chat en vivo</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4 relative z-10 max-w-4xl mx-auto">
        <Tarjeta className="bg-card shadow-sm border md:grid md:grid-cols-[1fr] overflow-hidden h-[70vh] flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Asistente Virtual</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                En línea ahora
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
            {mensajes.map((mensaje) => {
              const esUsuario = mensaje.autor === "usuario";
              return (
                <div key={mensaje.id} className={`flex flex-col ${esUsuario ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-sm ${esUsuario
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-border text-card-foreground rounded-tl-none"
                      }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{mensaje.texto}</p>
                    <span className={`text-[10px] block mt-1 text-rightOpacity-80 ${esUsuario ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {mensaje.hora}
                    </span>
                  </div>

                  {mensaje.accion === "whatsapp" && (
                    <Boton
                      className="mt-2 bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 shadow-sm animate-in fade-in slide-in-from-top-2"
                      onClick={abrirWhatsapp}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Abrir WhatsApp
                    </Boton>
                  )}
                </div>
              );
            })}

            {escribiendo && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={finChatRef} className="h-2" />
          </div>

          <div className="p-4 bg-card border-t border-border">
            {opcionesActuales.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {opcionesActuales.map((opcion, index) => (
                  <Boton
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-normal whitespace-normal"
                    onClick={() => manejarOpcionClick(opcion)}
                  >
                    {opcion.texto}
                  </Boton>
                ))}
              </div>
            ) : !escribiendo && (
              <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg gap-3 text-center">
                <p className="text-sm text-muted-foreground italic">La conversación ha finalizado.</p>
                <Boton
                  onClick={() => agregarRespuestaBot("inicio")}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Iniciar nueva consulta
                </Boton>
              </div>
            )}
          </div>
        </Tarjeta>
      </main>
    </div>
  );
};

export default ChatEnVivo;
