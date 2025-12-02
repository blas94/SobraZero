import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShoppingBag,
  Camera,
  ChevronDown,
} from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Entrada } from "@/components/ui/entrada";
import { AreaTexto } from "@/components/ui/area-texto";
import { Etiqueta } from "@/components/ui/etiqueta";
import FormasDecorativas from "@/components/FormasDecorativas";
import { toast } from "sonner";
import {
  DialogoAlerta,
  ContenidoDialogoAlerta,
  DescripcionDialogoAlerta,
  PieDialogoAlerta,
  EncabezadoDialogoAlerta,
  TituloDialogoAlerta,
} from "@/components/ui/dialogo-alerta";
import {
  Plegable,
  ContenidoPlegable,
  ActivadorPlegable,
} from "@/components/ui/plegable";

const EditarComercio = () => {
  const navegar = useNavigate();
  const [datosComercio, setDatosComercio] = useState(null);
  const [mostrarDialogoSinComercio, setMostrarDialogoSinComercio] =
    useState(false);
  const [campoEditando, setCampoEditando] = useState(null);
  const [productosExpandidos, setProductosExpandidos] = useState([]);
  const referenciaArchivo = useRef(null);

  const [nombreEditado, setNombreEditado] = useState("");
  const [tipoComercioEditado, setTipoComercioEditado] = useState("");
  const [direccionEditada, setDireccionEditada] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");
  const [horaRetiroInicio, setHoraRetiroInicio] = useState("");
  const [horaRetiroFin, setHoraRetiroFin] = useState("");
  const [precioOriginalEditado, setPrecioOriginalEditado] = useState("");
  const [precioDescuentoEditado, setPrecioDescuentoEditado] = useState("");
  const [telefonoEditado, setTelefonoEditado] = useState("");
  const [correoEditado, setCorreoEditado] = useState("");
  const [productosEditados, setProductosEditados] = useState([]);
  const [mostrarDialogoImagen, setMostrarDialogoImagen] = useState(false);
  const [erroresProductos, setErroresProductos] = useState({});

  const tiposComercio = [
    { id: "panaderia", label: "Panaderia" },
    { id: "supermercado", label: "Supermercado" },
    { id: "verduleria", label: "Verduleria" },
    { id: "restaurante", label: "Restaurante" },
  ];

  useEffect(() => {
    const comercioRegistrado = localStorage.getItem("comercioRegistrado");

    if (!comercioRegistrado) {
      setMostrarDialogoSinComercio(true);
      return;
    }

    const comercio = JSON.parse(comercioRegistrado);
    setDatosComercio(comercio);

    setNombreEditado(comercio.nombreComercio || "");
    setTipoComercioEditado(comercio.tipoComercio || "");
    setDireccionEditada(comercio.direccion || "");
    setDescripcionEditada(
      comercio.description ||
      "Bolsa sorpresa con productos variados del comercio"
    );
    const pickupTime = comercio.pickupTime || "18:00 - 20:00";
    const [start, end] = pickupTime.split(" - ");
    setHoraRetiroInicio(start || "18:00");
    setHoraRetiroFin(end || "20:00");
    setPrecioOriginalEditado(comercio.originalPrice?.toString() || "3000");
    setPrecioDescuentoEditado(comercio.discountedPrice?.toString() || "1000");
    setTelefonoEditado(comercio.telefono || "");
    setCorreoEditado(comercio.correo || "");
    setProductosEditados(comercio.products || []);
  }, []);

  const manejarClickImagen = () => {
    setMostrarDialogoImagen(true);
  };

  const manejarCambioImagen = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (!datosComercio) return;
        const imageUrl = reader.result;
        const comercioActualizado = { ...datosComercio, imageUrl };
        localStorage.setItem(
          "comercioRegistrado",
          JSON.stringify(comercioActualizado)
        );
        setDatosComercio(comercioActualizado);
        setMostrarDialogoImagen(false);
        toast.success("Imagen actualizada");
      };
      reader.readAsDataURL(file);
    }
  };

  const manejarAgregarProducto = () => {
    const nuevoProducto = {
      id: Date.now().toString(),
      name: "",
      stock: 0,
      weight: undefined,
      originalPrice: 0,
      discountedPrice: 0,
      imageUrl: undefined,
    };
    setProductosEditados([...productosEditados, nuevoProducto]);
  };

  const manejarCambioImagenProducto = (productoId, evento) => {
    const file = evento.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setProductosEditados(
          productosEditados.map((p) =>
            p.id === productoId ? { ...p, imageUrl } : p
          )
        );
        toast.success("Imagen del producto actualizada");
      };
      reader.readAsDataURL(file);
    }
  };

  const manejarActualizarProducto = (idProducto, campo, valor) => {
    setProductosEditados(
      productosEditados.map((p) =>
        p.id === idProducto ? { ...p, [campo]: valor } : p
      )
    );
  };

  const manejarEliminarProducto = (idProducto) => {
    setProductosEditados(productosEditados.filter((p) => p.id !== idProducto));
  };

  const alternarProductoExpandido = (productoId) => {
    setProductosExpandidos((prev) =>
      prev.includes(productoId)
        ? prev.filter((id) => id !== productoId)
        : [...prev, productoId]
    );
  };

  const manejarGuardarCampo = (campo) => {
    if (!datosComercio) return;

    const comercioActualizado = { ...datosComercio };

    switch (campo) {
      case "informacion":
        comercioActualizado.nombreComercio = nombreEditado;
        comercioActualizado.tipoComercio = tipoComercioEditado;
        comercioActualizado.direccion = direccionEditada;
        comercioActualizado.pickupTime = `${horaRetiroInicio} - ${horaRetiroFin}`;
        break;
      case "descripcion":
        comercioActualizado.description = descripcionEditada;
        break;
      case "retiro":
        comercioActualizado.pickupTime = `${horaRetiroInicio} - ${horaRetiroFin}`;
        break;
      case "precios":
        comercioActualizado.originalPrice = parseFloat(precioOriginalEditado);
        comercioActualizado.discountedPrice = parseFloat(
          precioDescuentoEditado
        );
        break;
      case "contacto":
        comercioActualizado.telefono = telefonoEditado;
        comercioActualizado.correo = correoEditado;
        break;
      case "productos":
        const errores = {};
        let hayErrores = false;

        productosEditados.forEach((producto) => {
          const errorProducto = {};

          if (!producto.name.trim()) {
            errorProducto.name = "El nombre es obligatorio";
            hayErrores = true;
          }
          if (producto.stock <= 0) {
            errorProducto.stock = "El stock debe ser mayor a 0";
            hayErrores = true;
          }
          if (!producto.originalPrice || producto.originalPrice <= 0) {
            errorProducto.originalPrice = "El precio original es obligatorio";
            hayErrores = true;
          }
          if (!producto.discountedPrice || producto.discountedPrice <= 0) {
            errorProducto.discountedPrice =
              "El precio con descuento es obligatorio";
            hayErrores = true;
          }
          if (
            producto.originalPrice &&
            producto.discountedPrice &&
            producto.originalPrice <= producto.discountedPrice
          ) {
            errorProducto.discountedPrice =
              "El precio con descuento debe ser menor al precio original";
            hayErrores = true;
          }

          if (Object.keys(errorProducto).length > 0) {
            errores[producto.id] = errorProducto;
          }
        });

        if (hayErrores) {
          setErroresProductos(errores);
          return;
        }

        setErroresProductos({});
        comercioActualizado.products = productosEditados;
        break;
    }

    localStorage.setItem(
      "comercioRegistrado",
      JSON.stringify(comercioActualizado)
    );
    setDatosComercio(comercioActualizado);
    setCampoEditando(null);
    setProductosExpandidos([]);
    toast.success("Cambios guardados");
  };

  const manejarCancelarEdicion = () => {
    if (!datosComercio) return;

    setNombreEditado(datosComercio.nombreComercio || "");
    setTipoComercioEditado(datosComercio.tipoComercio || "");
    setDireccionEditada(datosComercio.direccion || "");
    setDescripcionEditada(datosComercio.description || "");
    const pickupTime = datosComercio.pickupTime || "18:00 - 20:00";
    const [start, end] = pickupTime.split(" - ");
    setHoraRetiroInicio(start || "18:00");
    setHoraRetiroFin(end || "20:00");
    setPrecioOriginalEditado(datosComercio.originalPrice?.toString() || "");
    setPrecioDescuentoEditado(datosComercio.discountedPrice?.toString() || "");
    setTelefonoEditado(datosComercio.telefono || "");
    setCorreoEditado(datosComercio.correo || "");
    setProductosEditados(datosComercio.products || []);
    setErroresProductos({});
    setProductosExpandidos([]);

    setCampoEditando(null);
  };

  if (mostrarDialogoSinComercio) {
    return (
      <DialogoAlerta open={mostrarDialogoSinComercio}>
        <ContenidoDialogoAlerta>
          <EncabezadoDialogoAlerta>
            <TituloDialogoAlerta>No hay comercio registrado</TituloDialogoAlerta>
            <DescripcionDialogoAlerta>
              No podes acceder a esta seccion porque no hay ningun comercio
              registrado y con una solicitud aceptada en esta cuenta.
            </DescripcionDialogoAlerta>
          </EncabezadoDialogoAlerta>
          <PieDialogoAlerta>
            <Boton onClick={() => navegar("/perfil")}>Volver</Boton>
          </PieDialogoAlerta>
        </ContenidoDialogoAlerta>
      </DialogoAlerta>
    );
  }

  if (!datosComercio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6 relative">
      <FormasDecorativas />

      <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navegar("/perfil")}
            className="hover:bg-muted rounded-full p-1 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Editar tu comercio</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4 relative z-10">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg overflow-hidden group">
          {datosComercio.imageUrl ? (
            <img
              src={datosComercio.imageUrl}
              alt={`Imagen de portada de ${datosComercio.nombreComercio}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ShoppingBag className="w-20 h-20 text-primary/40" />
            </div>
          )}
          <button
            onClick={manejarClickImagen}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Camera className="w-12 h-12 text-white" />
          </button>
        </div>

        <DialogoAlerta
          open={mostrarDialogoImagen}
          onOpenChange={setMostrarDialogoImagen}
        >
          <ContenidoDialogoAlerta>
            <EncabezadoDialogoAlerta>
              <TituloDialogoAlerta>Cambiar imagen del comercio</TituloDialogoAlerta>
              <DescripcionDialogoAlerta>
                Para obtener los mejores resultados, te recomendamos usar una
                imagen en formato horizontal de medidas cercanas a 1920 x 1080
                pixeles.
              </DescripcionDialogoAlerta>
            </EncabezadoDialogoAlerta>
            <PieDialogoAlerta>
              <Boton
                variant="outline"
                onClick={() => setMostrarDialogoImagen(false)}
              >
                Cancelar
              </Boton>
              <Boton
                onClick={() => {
                  referenciaArchivo.current?.click();
                }}
              >
                Seleccionar imagen
              </Boton>
            </PieDialogoAlerta>
          </ContenidoDialogoAlerta>
        </DialogoAlerta>
        <input
          ref={referenciaArchivo}
          type="file"
          accept="image/*"
          onChange={manejarCambioImagen}
          className="hidden"
          aria-label="Cambiar imagen del comercio"
            {campoEditando !== "informacion" && (
              <Boton
                variant="ghost"
                size="sm"
                onClick={() => setCampoEditando("informacion")}
              >
                Editar
              </Boton>
            )}
          </div>

          {campoEditando === "informacion" ? (
            <div className="space-y-3">
              <div>
                <Etiqueta>Nombre del comercio</Etiqueta>
                <Entrada
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  placeholder="Nombre del comercio"
                />
              </div>
              <div>
                <Etiqueta>Tipo de comercio</Etiqueta>
                <div className="grid grid-cols-2 gap-3">
                  {tiposComercio.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setTipoComercioEditado(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${tipoComercioEditado === type.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Etiqueta>Dirección</Etiqueta>
                <Entrada
                  value={direccionEditada}
                  onChange={(e) => setDireccionEditada(e.target.value)}
                  placeholder="Dirección del comercio"
                />
              </div>
              <div>
                <Etiqueta>Horario de retiro - Inicio</Etiqueta>
                <Entrada
                  type="time"
                  value={horaRetiroInicio}
                  onChange={(e) => setHoraRetiroInicio(e.target.value)}
                />
              </div>
              <div>
                <Etiqueta>Horario de retiro - Fin</Etiqueta>
                <Entrada
                  type="time"
                  value={horaRetiroFin}
                  onChange={(e) => setHoraRetiroFin(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Boton
                  size="sm"
                  onClick={() => manejarGuardarCampo("informacion")}
                >
                  Guardar
                </Boton>
                <Boton
                  size="sm"
                  variant="outline"
                  onClick={manejarCancelarEdicion}
                >
                  Cancelar
                </Boton>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <ShoppingBag className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  {tiposComercio.find(
                    (t) => t.id === datosComercio.tipoComercio
                  )?.label || "Tipo no especificado"}
                </span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{datosComercio.direccion}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Retiro hoy: {datosComercio.pickupTime || "18:00 - 20:00"}
                </span>
              </div>
            </div>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Productos individuales</h3>
            {campoEditando !== "productos" && (
              <Boton
                variant="ghost"
                size="sm"
                onClick={() => setCampoEditando("productos")}
              >
                Editar
              </Boton>
            )}
          </div>

          {campoEditando === "productos" ? (
            <div className="space-y-4">
              {productosEditados.map((producto, index) => (
                <Tarjeta key={producto.id} className="p-3 bg-muted/50">
                  <Plegable
                    open={productosExpandidos.includes(producto.id)}
                    onOpenChange={() => alternarProductoExpandido(producto.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <ActivadorPlegable className="flex items-center gap-2 text-xs font-medium hover:underline cursor-pointer">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${productosExpandidos.includes(producto.id)
                            ? "rotate-180"
                            : ""
                            }`}
                        />
                        <span>Producto {index + 1}</span>
                      </ActivadorPlegable>
                      <Boton
                        variant="ghost"
                        size="sm"
                        onClick={() => manejarEliminarProducto(producto.id)}
                        className="h-6 w-6 p-0"
                      >
                        <span className="sr-only">Eliminar producto</span>X
                      </Boton>
                    </div>
                    <ContenidoPlegable>
                      <div className="space-y-2 pt-2">
                        <div>
                          <Etiqueta className="text-xs">
                            Imagen del producto (opcional)
                          </Etiqueta>
                          <div className="flex items-center gap-2">
                            {producto.imageUrl && (
                              <div className="relative">
                                <img
                                  src={producto.imageUrl}
                                  alt={`Imagen del producto ${producto.name}`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <button
                                  onClick={() =>
                                    manejarActualizarProducto(
                                      producto.id,
                                      "imageUrl",
                                      ""
                                    )
                                  }
                                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-destructive/90"
                                >
                                  X
                                </button>
                              </div>
                            )}
                            <Entrada
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                manejarCambioImagenProducto(producto.id, e)
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                        <div>
                          <Etiqueta className="text-xs">Nombre</Etiqueta>
                          <Entrada
                            value={producto.name}
                            onChange={(e) =>
                              manejarActualizarProducto(
                                producto.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Nombre del producto"
                            className="h-8"
                          />
                          {erroresProductos[producto.id]?.name && (
                            <p className="text-xs text-destructive mt-1">
                              {erroresProductos[producto.id].name}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Etiqueta className="text-xs">Stock</Etiqueta>
                            <Entrada
                              type="number"
                              value={producto.stock || ""}
                              onChange={(e) =>
                                manejarActualizarProducto(
                                  producto.id,
                                  "stock",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder=""
                              className="h-8"
                            />
                            {erroresProductos[producto.id]?.stock && (
                              <p className="text-xs text-destructive mt-1">
                                {erroresProductos[producto.id].stock}
                              </p>
                            )}
                          </div>
                          <div>
                            <Etiqueta className="text-xs">
                              Peso en kilos (opcional)
                            </Etiqueta>
                            <Entrada
                              type="number"
                              step="0.01"
                              min="0"
                              value={
                                producto.weight !== undefined
                                  ? producto.weight
                                  : ""
                              }
                              onChange={(e) =>
                                manejarActualizarProducto(
                                  producto.id,
                                  "weight",
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined
                                )
                              }
                              placeholder=""
                              className="h-8"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <Etiqueta className="text-xs">Precio original</Etiqueta>
                            <Entrada
                              type="number"
                              value={producto.originalPrice || ""}
                              onChange={(e) =>
                                manejarActualizarProducto(
                                  producto.id,
                                  "originalPrice",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder=""
                              className="h-8"
                            />
                            {erroresProductos[producto.id]?.originalPrice && (
                              <p className="text-xs text-destructive mt-1">
                                {erroresProductos[producto.id].originalPrice}
                              </p>
                            )}
                          </div>
                          <div>
                            <Etiqueta className="text-xs">
                              Precio con descuento
                            </Etiqueta>
                            <Entrada
                              type="number"
                              value={producto.discountedPrice || ""}
                              onChange={(e) =>
                                manejarActualizarProducto(
                                  producto.id,
                                  "discountedPrice",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder=""
                              className="h-8"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Este es el precio que se cobrara al publico
                            </p>
                            {erroresProductos[producto.id]?.discountedPrice && (
                              <p className="text-xs text-destructive mt-1">
                                {erroresProductos[producto.id].discountedPrice}
                              </p>
                            )}
                          </div>
                        </div>
                        {producto.discountedPrice > 0 && (
                          <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded">
                            <p className="text-xs font-medium text-green-700 dark:text-green-400">
                              Ganancia neta por producto vendido: $
                              {(producto.discountedPrice * 0.95).toFixed(2)}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                              SobraZero se lleva un 5% de comision
                            </p>
                          </div>
                        )}
                      </div>
                    </ContenidoPlegable>
                  </Plegable>
                </Tarjeta>
              ))}
              <Boton
                variant="outline"
                size="sm"
                onClick={manejarAgregarProducto}
                className="w-full"
              >
                Agregar producto
              </Boton>
              <div className="flex gap-2 pt-2">
                <Boton
                  size="sm"
                  onClick={() => manejarGuardarCampo("productos")}
                >
                  Guardar
                </Boton>
                <Boton
                  size="sm"
                  variant="outline"
                  onClick={manejarCancelarEdicion}
                >
                  Cancelar
                </Boton>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {datosComercio.products && datosComercio.products.length > 0 ? (
                datosComercio.products.map((producto, index) => (
                  <div
                    key={producto.id}
                    className="text-sm text-muted-foreground"
                  >
                    <strong>Producto {index + 1}:</strong>{" "}
                    <strong>Nombre:</strong> {producto.name} -{" "}
                    <strong>Stock:</strong> {producto.stock}
                    {producto.weight && (
                      <>
                        {" "}
                        - <strong>Peso:</strong> {producto.weight}kilos
                      </>
                    )}{" "}
                    - <strong>Precio con descuento:</strong> $
                    {producto.discountedPrice}
                    {producto.discountedPrice > 0 && (
                      <>
                        {" "}
                        - <strong>Ganancia neta:</strong> $
                        {(producto.discountedPrice * 0.95).toFixed(2)}
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay productos individuales registrados
                </p>
              )}
            </div>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Información de contacto</h2>
            {campoEditando !== "contacto" && (
              <Boton
                variant="ghost"
                size="sm"
                onClick={() => setCampoEditando("contacto")}
              >
                Editar
              </Boton>
            )}
          </div>

          {campoEditando === "contacto" ? (
            <div className="space-y-3">
              <div>
                <Etiqueta>Teléfono</Etiqueta>
                <Entrada
                  value={telefonoEditado}
                  onChange={(e) => setTelefonoEditado(e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>
              <div>
                <Etiqueta>Email</Etiqueta>
                <Entrada
                  type="email"
                  value={correoEditado}
                  onChange={(e) => setCorreoEditado(e.target.value)}
                  placeholder="Correo electrónico"
                />
              </div>
              <div className="flex gap-2">
                <Boton
                  size="sm"
                  onClick={() => manejarGuardarCampo("contacto")}
                >
                  Guardar
                </Boton>
                <Boton
                  size="sm"
                  variant="outline"
                  onClick={manejarCancelarEdicion}
                >
                  Cancelar
                </Boton>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <span className="font-medium">Teléfono:</span>
                <span>{datosComercio.telefono || "No especificado"}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <span className="font-medium">Email:</span>
                <span>{datosComercio.correo || "No especificado"}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground pt-3 border-t border-border mt-3">
            <strong>Aclaración:</strong> Esta información no se visualizará
            públicamente. Solo quedará en registro personal de SobraZero para
            resolver cualquier inconveniente.
          </p>
        </Tarjeta>
      </div>
    </div>
  );
};

export default EditarComercio;
