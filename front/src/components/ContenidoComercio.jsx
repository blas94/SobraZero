import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Star, ShoppingBag, Heart } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { AreaTexto } from "@/components/ui/AreaTexto";
import { Etiqueta } from "@/components/ui/Etiqueta";
import SeccionReseñas from "@/components/SeccionResenas";
import { toast } from "sonner";
import { crearReserva } from "@/services/reservas";
import {
  obtenerReseñas,
  verificarPuedeReseñar,
  crearReseña,
  editarReseña,
} from "@/services/reseñas";
import { crearPreferencia } from "@/services/pagos";

const ESTADO_COMERCIOS_KEY = "estadoComercios";

const safeParse = (str, fallback) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

const ContenidoComercio = ({
  idComercio,
  comercios,
  mostrarBotonVolver = false,
  alCerrar,
}) => {
  const navegar = useNavigate();

  const [productosSeleccionados, setProductosSeleccionados] = useState({});
  const [nuevaReseñaCalificacion, setNuevaReseñaCalificacion] = useState(5);
  const [nuevaReseñaComentario, setNuevaReseñaComentario] = useState("");
  const [reseñas, setReseñas] = useState([]);
  const [puedeReseñar, setPuedeReseñar] = useState(false);
  const [yaReseñó, setYaReseñó] = useState(false);
  const [motivoNoReseñar, setMotivoNoReseñar] = useState("");
  const [editandoReseñaId, setEditandoReseñaId] = useState(null);
  const [reseñaOriginal, setReseñaOriginal] = useState({
    calificacion: 5,
    comentario: "",
  });

  const [esFavorito, setEsFavorito] = useState(() => {
    const favoritos = localStorage.getItem("favoritos");
    const arr = favoritos ? safeParse(favoritos, []) : [];
    return arr.includes(idComercio);
  });



  const [comercio, setComercio] = useState(() => {
    const estadoGuardado = localStorage.getItem(ESTADO_COMERCIOS_KEY);

    if (estadoGuardado) {
      const listaEstado = safeParse(estadoGuardado, []);
      const comercioPersistido = listaEstado.find((s) => s.id === idComercio) || null;

      if (comercioPersistido) {
        return {
          ...comercioPersistido,
          productos: (comercioPersistido.productos || []).map((p) => ({ ...p })),
        };
      }
    }

    const comercioBase = comercios.find((s) => s.id === idComercio) || null;
    if (!comercioBase) return null;

    return {
      ...comercioBase,
      productos: (comercioBase.productos || []).map((p) => ({ ...p })),
    };
  });

  useEffect(() => {
    const estadoGuardado = localStorage.getItem(ESTADO_COMERCIOS_KEY);

    if (estadoGuardado) {
      const listaEstado = safeParse(estadoGuardado, []);
      const comercioPersistido = listaEstado.find((s) => s.id === idComercio) || null;

      if (comercioPersistido) {
        setComercio({
          ...comercioPersistido,
          productos: (comercioPersistido.productos || []).map((p) => ({ ...p })),
        });
        setProductosSeleccionados({});
        return;
      }
    }

    const comercioBase = comercios.find((s) => s.id === idComercio) || null;
    if (!comercioBase) {
      setComercio(null);
    } else {
      setComercio({
        ...comercioBase,
        productos: (comercioBase.productos || []).map((p) => ({ ...p })),
      });
    }

    setProductosSeleccionados({});
  }, [idComercio, comercios]);



  useEffect(() => {
    const cargarReseñas = async () => {
      if (!idComercio) return;
      try {
        const reseñasDelBackend = await obtenerReseñas(idComercio);
        setReseñas(reseñasDelBackend);
      } catch (error) {
        console.error("Error cargando reseñas:", error);
        setReseñas([]);
      }
    };

    cargarReseñas();
  }, [idComercio]);

  useEffect(() => {
    const verificarPermisos = async () => {
      if (!idComercio) return;

      try {
        const { puedeReseñar, yaReseñó, motivo, reseñaExistente } =
          await verificarPuedeReseñar(idComercio);

        setPuedeReseñar(puedeReseñar);
        setYaReseñó(yaReseñó);
        setMotivoNoReseñar(motivo || "");

        if (yaReseñó && reseñaExistente) {
          setNuevaReseñaCalificacion(reseñaExistente.calificacion);
          setNuevaReseñaComentario(reseñaExistente.comentario);
          setEditandoReseñaId(reseñaExistente.id);
          setReseñaOriginal({
            calificacion: reseñaExistente.calificacion,
            comentario: reseñaExistente.comentario,
          });
          setPuedeReseñar(true);
        }
      } catch (error) {
        console.error("Error verificando permisos:", error);
        setPuedeReseñar(false);
      }
    };

    verificarPermisos();
  }, [idComercio]);

  const actualizarCantidadProducto = (productoId, delta) => {
    if (!comercio) return;

    const producto = comercio.productos.find((p) => p.id === productoId);
    if (!producto) return;

    const cantidadActual = productosSeleccionados[productoId] || 0;
    const nuevaCantidad = Math.max(0, Math.min(producto.stock, cantidadActual + delta));

    setProductosSeleccionados((prev) => {
      if (nuevaCantidad === 0) {
        const { [productoId]: _, ...resto } = prev;
        return resto;
      }
      return { ...prev, [productoId]: nuevaCantidad };
    });
  };

  const calcularTotal = () => {
    if (!comercio) return 0;
    return Object.entries(productosSeleccionados).reduce((total, [productoId, cantidad]) => {
      const producto = comercio.productos.find((p) => p.id === productoId);
      return total + (producto ? producto.precioDescuento * cantidad : 0);
    }, 0);
  };

  const obtenerTotalItems = () =>
    Object.values(productosSeleccionados).reduce((suma, cantidad) => suma + cantidad, 0);

  const manejarReserva = async () => {
    if (!comercio) return;

    const total = calcularTotal();
    const totalItems = obtenerTotalItems();

    if (totalItems === 0) {
      toast.error("Seleccioná al menos un producto");
      return;
    }



    const seleccionSnapshot = { ...productosSeleccionados };

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Necesitás iniciar sesión para reservar");
        return;
      }

      const user = safeParse(userStr, null);
      const usuarioId = user?.id || user?._id;

      console.log("🔍 [DEBUG] Usuario obtenido:", { id: user?.id, _id: user?._id, usuarioId });

      if (!usuarioId) {
        toast.error("No se pudo identificar al usuario");
        return;
      }

      // 1) Crear reserva(s)
      let reservaIdReal = null;

      for (const [productoId, cant] of Object.entries(seleccionSnapshot)) {
        const cantidad = Number(cant);
        if (!cantidad || cantidad <= 0) continue;

        const producto = comercio.productos.find((p) => p.id === productoId);
        if (!producto) continue;

        const resReserva = await crearReserva({
          usuarioId,
          comercioId: idComercio,
          productoNombre: producto.nombre,
          cantidad,
        });

        const idMongo = resReserva?.reserva?._id;
        if (!reservaIdReal && idMongo) reservaIdReal = idMongo;
      }

      if (!reservaIdReal) {
        toast.error("No se pudo crear la reserva en el servidor");
        return;
      }

      // 2) Actualizar stock local (UI + localStorage)
      setComercio((prev) => {
        if (!prev) return prev;

        const productosActualizados = prev.productos.map((prod) => {
          const reservada = seleccionSnapshot[prod.id] || 0;
          if (!reservada) return prod;
          return { ...prod, stock: prod.stock - reservada };
        });

        let nuevoDisponible = prev.disponibles - totalItems;
        if (nuevoDisponible < 0) nuevoDisponible = 0;

        const comercioActualizado = {
          ...prev,
          productos: productosActualizados,
          disponibles: nuevoDisponible,
        };

        const estadoPrevio = localStorage.getItem(ESTADO_COMERCIOS_KEY);
        const listaEstado = estadoPrevio ? safeParse(estadoPrevio, comercios) : comercios;

        const comerciosActualizados = (listaEstado || []).map((s) =>
          s.id === idComercio
            ? { ...s, productos: productosActualizados, disponibles: nuevoDisponible }
            : s
        );

        localStorage.setItem(ESTADO_COMERCIOS_KEY, JSON.stringify(comerciosActualizados));

        return comercioActualizado;
      });

      toast.success("Reserva creada. Redirigiendo a Mercado Pago...");

      // Limpio selección antes de ir a MP
      setProductosSeleccionados({});

      // 3) Crear preferencia y redirigir (✅ ya NO forzamos sandbox acá)
      const pref = await crearPreferencia({
        reservaId: reservaIdReal,
        usuarioId,
        precio_total: total,
      });

      console.log("PREF BACK:", pref);

      const checkoutUrl = pref?.checkout_url;

      if (!checkoutUrl) {
        toast.error("No se pudo iniciar el pago (checkout_url vacío)");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error al reservar:", error);
      toast.error(error?.response?.data?.message || "Error al crear la reserva o el pago");
    }
  };

  const manejarAgregarReseña = async () => {
    if (!nuevaReseñaComentario.trim()) {
      toast.error("Por favor escribí un comentario");
      return;
    }

    try {
      let resultado;

      if (editandoReseñaId) {
        const sinCambios =
          nuevaReseñaCalificacion === reseñaOriginal.calificacion &&
          nuevaReseñaComentario.trim() === reseñaOriginal.comentario.trim();

        if (sinCambios) {
          toast.error("No se detectaron cambios en la reseña");
          return;
        }

        resultado = await editarReseña(editandoReseñaId, {
          calificacion: nuevaReseñaCalificacion,
          comentario: nuevaReseñaComentario,
        });

        toast.success("Reseña actualizada con éxito");

        setReseñas(reseñas.map((r) => (r.id === editandoReseñaId ? resultado.reseña : r)));

        setEditandoReseñaId(null);
        setPuedeReseñar(false);
        setYaReseñó(true);
      } else {
        resultado = await crearReseña(idComercio, {
          calificacion: nuevaReseñaCalificacion,
          comentario: nuevaReseñaComentario,
        });

        toast.success("Reseña publicada con éxito");
        setReseñas([resultado.reseña, ...reseñas]);
        setPuedeReseñar(false);
        setYaReseñó(true);
      }

      setNuevaReseñaComentario("");
      setNuevaReseñaCalificacion(5);
    } catch (error) {
      console.error("Error con reseña:", error);
      toast.error(error?.response?.data?.error || "No se pudo procesar la reseña");
    }
  };

  const manejarFavorito = () => {
    const favoritos = localStorage.getItem("favoritos");
    let arr = favoritos ? safeParse(favoritos, []) : [];

    if (esFavorito) {
      arr = arr.filter((id) => id !== idComercio);
      toast.success("Eliminado de favoritos");
    } else {
      arr.push(idComercio);
      toast.success("Agregado a favoritos");
    }

    localStorage.setItem("favoritos", JSON.stringify(arr));
    setEsFavorito(!esFavorito);
  };

  useEffect(() => {
    const favoritos = localStorage.getItem("favoritos");
    const arr = favoritos ? safeParse(favoritos, []) : [];
    setEsFavorito(arr.includes(idComercio));
  }, [idComercio, comercios]);

  if (!comercio) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Comercio no encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
        {comercio.imagenUrl ? (
          <img
            src={comercio.imagenUrl}
            alt={`Imagen de ${comercio.nombre}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ShoppingBag className="w-20 h-20 text-primary/40" />
          </div>
        )}

        {mostrarBotonVolver && (
          <Boton
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => (alCerrar ? alCerrar() : navegar(-1))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Boton>
        )}
      </div>

      <div className="px-4">
        <Tarjeta className="p-4 mb-4 shadow-card-hover -mt-24 relative z-10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{comercio.nombre}</h2>
              <p className="text-sm text-muted-foreground capitalize">{comercio.categoria}</p>
            </div>
            <button
              onClick={manejarFavorito}
              className={`flex-shrink-0 transition-transform hover:scale-110 ${esFavorito ? "text-success" : "text-muted-foreground"
                }`}
            >
              <Heart className={`w-6 h-6 ${esFavorito ? "fill-success" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{comercio.calificacion}</span>
            <span className="text-sm text-muted-foreground">{comercio.totalResenas} Reseñas</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                {comercio.direccion}{comercio.distancia ? ` ${comercio.distancia}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                Retiro hoy: {(() => {
                  const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long' }).toLowerCase();
                  const horarioHoy = comercio.horarios?.find(h => h.dia === hoy);
                  if (horarioHoy && horarioHoy.abierto) {
                    return `${horarioHoy.horaApertura} - ${horarioHoy.horaCierre}`;
                  }
                  return comercio.horarioRetiro || "Cerrado";
                })()}
              </span>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 mb-4">
          <h3 className="font-medium text-sm mb-3">Productos disponibles:</h3>
          <div className="space-y-3">
            {comercio.productos.map((producto) => (
              <div
                key={producto.id}
                className="border border-border rounded-lg overflow-hidden flex h-40"
              >
                <div className="w-32 bg-muted relative flex-shrink-0">
                  {producto.imageUrl ? (
                    <img
                      src={producto.imageUrl}
                      alt={`Foto de ${producto.nombre}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm line-clamp-2">
                        {producto.nombre}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground line-through">
                        ${producto.precioOriginal}
                      </span>
                      <span className="text-base font-bold text-primary">
                        ${producto.precioDescuento}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      Unidades disponibles: {producto.stock}
                      {producto.weight && ` - ${producto.weight} kg`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-2 self-start">
                    <Boton
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-primary/20"
                      onClick={() => actualizarCantidadProducto(producto.id, -1)}
                      disabled={!productosSeleccionados[producto.id]}
                    >
                      -
                    </Boton>
                    <span className="font-semibold w-6 text-center text-sm">
                      {productosSeleccionados[producto.id] || 0}
                    </span>
                    <Boton
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-primary/20"
                      onClick={() => actualizarCantidadProducto(producto.id, 1)}
                      disabled={
                        (productosSeleccionados[producto.id] || 0) >= producto.stock
                      }
                    >
                      +
                    </Boton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 mb-4">
          <h3 className="font-semibold mb-3">Resumen</h3>

          {obtenerTotalItems() > 0 ? (
            <>
              <div className="space-y-2 mb-4">
                {Object.entries(productosSeleccionados).map(
                  ([productoId, cantidad]) => {
                    const producto = comercio.productos.find(
                      (p) => p.id === productoId
                    );
                    if (!producto) return null;

                    return (
                      <div key={productoId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {producto.nombre} x {cantidad}
                        </span>
                        <span className="font-medium">
                          ${(producto.precioDescuento * cantidad).toLocaleString()}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${calcularTotal().toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {obtenerTotalItems()} producto{obtenerTotalItems() > 1 ? "s" : ""} seleccionado
                  {obtenerTotalItems() > 1 ? "s" : ""}
                </p>
              </div>

              <Boton
                className="w-full"
                size="lg"
                onClick={manejarReserva}

              >
                Reservar por ${calcularTotal().toLocaleString()}
              </Boton>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Seleccioná productos para continuar
            </p>
          )}
        </Tarjeta>

        <Tarjeta className="p-4 mb-10">
          <h3 className="font-semibold mb-4">Reseñas</h3>

          <SeccionReseñas
            reseñas={reseñas}
            calificacionPromedio={comercio.calificacion}
            totalReseñas={reseñas.length}
          />

          {puedeReseñar ? (
            <div className="mt-6">
              <div className="mb-4">
                <Etiqueta className="mb-2 block text-sm">Calificación</Etiqueta>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((estrella) => (
                    <button
                      key={estrella}
                      type="button"
                      onClick={() => setNuevaReseñaCalificacion(estrella)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${estrella <= nuevaReseñaCalificacion
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <Etiqueta htmlFor="comentario-reseña" className="mb-2 block text-sm">
                  Comentario
                </Etiqueta>
                <AreaTexto
                  id="comentario-reseña"
                  placeholder="Contanos tu experiencia..."
                  value={nuevaReseñaComentario}
                  onChange={(e) => setNuevaReseñaComentario(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Boton onClick={manejarAgregarReseña} className="w-full">
                {editandoReseñaId ? "Actualizar reseña" : "Publicar reseña"}
              </Boton>
            </div>
          ) : yaReseñó && !editandoReseñaId ? (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-sm text-green-700 dark:text-green-400">
                ¡Gracias por tu reseña! Podés editarla cuando quieras volviendo a esta página.
              </p>
            </div>
          ) : !yaReseñó ? (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                {motivoNoReseñar ||
                  "Necesitás realizar una reserva para poder dejar una reseña"}
              </p>
            </div>
          ) : null}
        </Tarjeta>
      </div>
    </>
  );
};

export default ContenidoComercio;