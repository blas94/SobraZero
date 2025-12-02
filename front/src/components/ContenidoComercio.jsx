import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Tarjeta } from "@/components/ui/tarjeta";
import { AreaTexto } from "@/components/ui/area-texto";
import { Etiqueta } from "@/components/ui/etiqueta";
import SeccionResenas from "@/components/SeccionResenas";
import { toast } from "sonner";
import { crearReserva } from "@/services/reservas";
import { obtenerTarjetaPrincipal } from "@/services/metodos-pago";

const mapaOfertaPorComercio = {
  1: "68c753ffb17ad728abc253e1",
  2: "68c7546ab17ad728abc253e5",
  3: "68c754bbb17ad728abc253e7",
  4: "6918c3ef9a76952f91f39741",
  5: "6918c3159a76952f91f3973f",
};

const ESTADO_COMERCIOS_KEY = "estadoComercios";

const USUARIO_PRUEBA_ID = "68c637445ceb927c5a2fc14c";

const ContenidoComercio = ({
  idComercio,
  comercios,
  resenasGlobales,
  mostrarBotonVolver = false,
  alCerrar,
}) => {
  const navegar = useNavigate();

  const [comercio, setComercio] = useState(() => {
    const estadoGuardado = localStorage.getItem(ESTADO_COMERCIOS_KEY);
    if (estadoGuardado) {
      try {
        const listaEstado = JSON.parse(estadoGuardado);
        const comercioPersistido =
          listaEstado.find((s) => s.id === idComercio) || null;
        if (comercioPersistido) {
          return {
            ...comercioPersistido,
            productos: comercioPersistido.productos.map((p) => ({ ...p })),
          };
        }
      } catch { }
    }

    const comercioBase = comercios.find((s) => s.id === idComercio) || null;
    if (!comercioBase) return null;
    return {
      ...comercioBase,
      productos: comercioBase.productos.map((p) => ({ ...p })),
    };
  });

  useEffect(() => {
    const estadoGuardado = localStorage.getItem(ESTADO_COMERCIOS_KEY);
    if (estadoGuardado) {
      try {
        const listaEstado = JSON.parse(estadoGuardado);
        const comercioPersistido =
          listaEstado.find((s) => s.id === idComercio) || null;
        if (comercioPersistido) {
          setComercio({
            ...comercioPersistido,
            productos: comercioPersistido.productos.map((p) => ({ ...p })),
          });
          return;
        }
      } catch { }
    }

    const comercioBase = comercios.find((s) => s.id === idComercio) || null;
    if (!comercioBase) {
      setComercio(null);
    } else {
      setComercio({
        ...comercioBase,
        productos: comercioBase.productos.map((p) => ({ ...p })),
      });
    }

    setProductosSeleccionados({});
  }, [idComercio, comercios]);

  const [productosSeleccionados, setProductosSeleccionados] = useState({});
  const [nuevaResenaCalificacion, setNuevaResenaCalificacion] = useState(5);
  const [nuevaResenaComentario, setNuevaResenaComentario] = useState("");
  const [resenasLocales, setResenasLocales] = useState([]);
  const [esFavorito, setEsFavorito] = useState(() => {
    const favoritos = localStorage.getItem("favoritos");
    if (favoritos) {
      const arr = JSON.parse(favoritos);
      return arr.includes(idComercio);
    }
    return false;
  });
  const [tarjetaPrincipal, setTarjetaPrincipal] = useState(null);

  useEffect(() => {
    const cargarTarjeta = async () => {
      try {
        const tarjeta = await obtenerTarjetaPrincipal();
        setTarjetaPrincipal(tarjeta);
      } catch (e) {
        console.error("Error obteniendo tarjeta principal:", e);
      }
    };
    cargarTarjeta();
  }, []);

  const yaReservo = () => {
    if (!comercio) return false;
    const datosPedidos = localStorage.getItem("pedidos");
    if (!datosPedidos) return false;
    const pedidos = JSON.parse(datosPedidos);
    return pedidos.some(
      (pedido) =>
        (pedido.nombreComercio || pedido.storeName) === comercio.nombre
    );
  };

  const resenasBase = resenasGlobales[idComercio] || [];
  const resenas = [...resenasLocales, ...resenasBase];

  const actualizarCantidadProducto = (productoId, delta) => {
    if (!comercio) return;
    const producto = comercio.productos.find((p) => p.id === productoId);
    if (!producto) return;

    const cantidadActual = productosSeleccionados[productoId] || 0;
    const nuevaCantidad = Math.max(
      0,
      Math.min(producto.stock, cantidadActual + delta)
    );

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
    return Object.entries(productosSeleccionados).reduce(
      (total, [productoId, cantidad]) => {
        const producto = comercio.productos.find((p) => p.id === productoId);
        return total + (producto ? producto.precioDescuento * cantidad : 0);
      },
      0
    );
  };

  const obtenerTotalItems = () => {
    return Object.values(productosSeleccionados).reduce(
      (suma, cantidad) => suma + cantidad,
      0
    );
  };

  const manejarReserva = async () => {
    if (!comercio) return;

    const total = calcularTotal();
    const totalItems = obtenerTotalItems();

    if (totalItems === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }

    let tarjeta = tarjetaPrincipal;
    if (!tarjeta) {
      try {
        tarjeta = await obtenerTarjetaPrincipal();
        setTarjetaPrincipal(tarjeta);
      } catch (e) {
        console.error("Error obteniendo tarjeta principal:", e);
      }
    }

    if (!tarjeta) {
      toast.error(
        "Primero agrega un metodo de pago en Configuracion (tarjetas guardadas)"
      );
      return;
    }

    const confirmar = window.confirm(
      `Vas a pagar con "${tarjeta.alias}" (${tarjeta.marca}, terminada en ${tarjeta.ultimos4}). Deseas continuar?`
    );

    if (!confirmar) return;

    const ofertaId = mapaOfertaPorComercio[idComercio];
    if (!ofertaId) {
      toast.error("No se encontro la oferta asociada a este comercio");
      return;
    }

    try {
      const entradas = Object.entries(productosSeleccionados);

      for (const [productoId, cant] of entradas) {
        const cantidad = Number(cant);
        if (!cantidad || cantidad <= 0) continue;

        const producto = comercio.productos.find((p) => p.id === productoId);
        if (!producto) continue;

        await crearReserva({
          usuarioId: USUARIO_PRUEBA_ID,
          ofertaId,
          productoNombre: producto.nombre,
          cantidad,
        });
      }

      const totalItemsReservados = totalItems;

      setComercio((prev) => {
        if (!prev) return prev;

        const productosActualizados = prev.productos.map((prod) => {
          const reservada = productosSeleccionados[prod.id] || 0;
          if (!reservada) return prod;
          return {
            ...prod,
            stock: prod.stock - reservada,
          };
        });

        let nuevoDisponible = prev.disponibles - totalItemsReservados;
        if (nuevoDisponible < 0) nuevoDisponible = 0;

        const comercioActualizado = {
          ...prev,
          productos: productosActualizados,
          disponibles: nuevoDisponible,
        };

        const estadoPrevio = localStorage.getItem(ESTADO_COMERCIOS_KEY);
        let listaEstado;
        if (estadoPrevio) {
          try {
            listaEstado = JSON.parse(estadoPrevio);
          } catch {
            listaEstado = comercios;
          }
        } else {
          listaEstado = comercios;
        }

        const comerciosActualizados = listaEstado.map((s) =>
          s.id === idComercio
            ? {
              ...s,
              productos: productosActualizados,
              disponibles: nuevoDisponible,
            }
            : s
        );

        localStorage.setItem(
          ESTADO_COMERCIOS_KEY,
          JSON.stringify(comerciosActualizados)
        );

        return comercioActualizado;
      });

      const productosDetalle = Object.entries(productosSeleccionados).map(
        ([id, cantidad]) => {
          const prod = comercio.productos.find((p) => p.id === id);
          return {
            nombre: prod ? prod.nombre : "Producto desconocido",
            cantidad: `${cantidad} unidades`,
          };
        }
      );

      const nuevoPedido = {
        id: `pedido-${Date.now()}`,
        nombreComercio: comercio.nombre,
        estado: "pendiente",
        horarioRetiro: comercio.horarioRetiro,
        direccion: comercio.direccion,
        total,
        articulos: totalItems,
        fecha: "Hoy",
        productos: productosDetalle,
      };

      const pedidosExistentes = localStorage.getItem("pedidos");
      const pedidos = pedidosExistentes ? JSON.parse(pedidosExistentes) : [];
      pedidos.unshift(nuevoPedido);
      localStorage.setItem("pedidos", JSON.stringify(pedidos));

      toast.success("Reserva confirmada", {
        description: `Retira tu pedido hoy entre ${comercio.horarioRetiro}`,
      });

      setProductosSeleccionados({});
    } catch (error) {
      console.error("Error al reservar:", error);
      toast.error(
        error?.response?.data?.message ||
        "Error al crear la reserva en el servidor"
      );
    }
  };

  const manejarAgregarResena = () => {
    if (!nuevaResenaComentario.trim()) {
      toast.error("Por favor escribi un comentario");
      return;
    }

    const nueva = {
      id: Date.now().toString(),
      userName: "Usuario Actual",
      rating: nuevaResenaCalificacion,
      comment: nuevaResenaComentario,
      date: "Ahora",
    };

    setResenasLocales([nueva, ...resenasLocales]);
    setNuevaResenaComentario("");
    setNuevaResenaCalificacion(5);
    toast.success("Reseña agregada con éxito");
  };

  const manejarFavorito = () => {
    const favoritos = localStorage.getItem("favoritos");
    let arr = favoritos ? JSON.parse(favoritos) : [];

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
    if (favoritos) {
      const arr = JSON.parse(favoritos);
      setEsFavorito(arr.includes(idComercio));
    } else {
      setEsFavorito(false);
    }
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ShoppingBag className="w-20 h-20 text-primary/40" />
        </div>

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
          <div className="flex items-start justify_between gap-3 mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{comercio.nombre}</h2>
              <p className="text-sm text-muted-foreground capitalize">
                {comercio.categoria}
              </p>
            </div>
            <button
              onClick={manejarFavorito}
              className={`flex-shrink-0 transition-transform hover:scale-110 ${esFavorito ? "text-success" : "text-muted-foreground"
                }`}
            >
              <Heart
                className={`w-6 h-6 ${esFavorito ? "fill-success" : ""}`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{comercio.calificacion}</span>
            <span className="text-sm text-muted-foreground">
              ({comercio.totalResenas} reseñas)
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                {comercio.direccion} - {comercio.distancia}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Retiro hoy: {comercio.horarioRetiro}</span>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 mb-4">
          <h3 className="font-medium text-sm mb-3">Productos disponibles:</h3>
          <div className="space-y-3">
            {comercio.productos.map((producto) => (
              <div
                key={producto.id}
                className="p-3 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {producto.imageUrl ? (
                    <img
                      src={producto.imageUrl}
                      alt={`Foto de ${producto.nombre}`}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{producto.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground line-through">
                        ${producto.precioOriginal}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        ${producto.precioDescuento}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unidades disponibles: {producto.stock}
                      {producto.weight && ` - Peso: ${producto.weight} kilo/s`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Boton
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => actualizarCantidadProducto(producto.id, -1)}
                    disabled={!productosSeleccionados[producto.id]}
                  >
                    -
                  </Boton>
                  <span className="font-semibold w-8 text-center text-sm">
                    {productosSeleccionados[producto.id] || 0}
                  </span>
                  <Boton
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => actualizarCantidadProducto(producto.id, 1)}
                    disabled={
                      (productosSeleccionados[producto.id] || 0) >=
                      producto.stock
                    }
                  >
                    +
                  </Boton>
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
                      <div
                        key={productoId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {producto.nombre} x {cantidad}
                        </span>
                        <span className="font-medium">
                          $
                          {(
                            producto.precioDescuento * cantidad
                          ).toLocaleString()}
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
                  {obtenerTotalItems()} producto
                  {obtenerTotalItems() > 1 ? "s" : ""} seleccionado
                  {obtenerTotalItems() > 1 ? "s" : ""}
                </p>
              </div>

              <Boton className="w-full" size="lg" onClick={manejarReserva}>
                Reservar por ${calcularTotal().toLocaleString()}
              </Boton>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Selecciona productos para continuar
            </p>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <h3 className="font-semibold mb-4">Reseñas</h3>

          <SeccionResenas
            resenas={resenas}
            calificacionPromedio={comercio.calificacion}
            totalResenas={comercio.totalResenas + resenasLocales.length}
          />

          {yaReservo() ? (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-3">Deja tu reseña</h3>

              <div className="mb-3">
                <Etiqueta className="mb-2 block text-sm">Calificacion</Etiqueta>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((puntuacion) => (
                    <button
                      key={puntuacion}
                      onClick={() => setNuevaResenaCalificacion(puntuacion)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${puntuacion <= nuevaResenaCalificacion
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <Etiqueta
                  htmlFor="comentario-resena"
                  className="mb-2 block text-sm"
                >
                  Comentario
                </Etiqueta>
                <AreaTexto
                  id="comentario-resena"
                  placeholder="Contanos tu experiencia..."
                  value={nuevaResenaComentario}
                  onChange={(e) => setNuevaResenaComentario(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Boton onClick={manejarAgregarResena} className="w-full">
                Publicar reseña
              </Boton>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Necesitas reservar en este comercio para poder dejar una reseña
              </p>
            </div>
          )}
        </Tarjeta>
      </div>
    </>
  );
};

export default ContenidoComercio;
