import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShoppingBag,
  Camera,
  ChevronDown,
  X,
  Trash2,
} from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { Entrada } from "@/components/ui/Entrada";
import { AreaTexto } from "@/components/ui/AreaTexto";
import { Etiqueta } from "@/components/ui/Etiqueta";
import AutocompleteDireccion from "@/components/AutocompleteDireccion";
import SelectorHorarios from "@/components/SelectorHorarios";
import FormasDecorativas from "@/components/FormasDecorativas";
import { toast } from "sonner";
import {
  DialogoAlerta,
  ContenidoDialogoAlerta,
  DescripcionDialogoAlerta,
  PieDialogoAlerta,
  EncabezadoDialogoAlerta,
  TituloDialogoAlerta,
} from "@/components/ui/DialogoAlerta";
import {
  Plegable,
  ContenidoPlegable,
  ActivadorPlegable,
} from "@/components/ui/Plegable";
import { obtenerMisComercios, editarComercio } from "@/services/comercios";

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
  const [aliasEditado, setAliasEditado] = useState("");
  const [horariosEditados, setHorariosEditados] = useState([]);
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
    const cargarComercio = async () => {
      try {
        const comercios = await obtenerMisComercios();

        if (comercios.length === 0) {
          setMostrarDialogoSinComercio(true);
          return;
        }

        // Tomar el primer comercio (el usuario solo puede tener uno)
        const comercio = comercios[0];
        setDatosComercio(comercio);

        // Mapear datos de la API al formato del componente
        setNombreEditado(comercio.nombre || "");
        setTipoComercioEditado(comercio.rubro || "");
        setDireccionEditada(comercio.direccion || "");
        setDescripcionEditada(
          comercio.descripcion ||
          "Bolsa sorpresa con productos variados del comercio"
        );

        const horarioRetiro = comercio.horarioRetiro || "18:00 - 20:00";
        const [start, end] = horarioRetiro.split(" - ");
        setHoraRetiroInicio(start || "18:00");
        setHoraRetiroFin(end || "20:00");

        // Cargar horarios semanales o usar valores por defecto
        const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
        const horariosIniciales = comercio.horarios && comercio.horarios.length > 0
          ? comercio.horarios
          : DIAS_SEMANA.map(dia => ({
            dia,
            abierto: ["sabado", "domingo"].includes(dia) ? false : true,
            horaApertura: "09:00",
            horaCierre: "18:00",
          }));
        setHorariosEditados(horariosIniciales);

        setPrecioOriginalEditado(comercio.precioOriginal?.toString() || "");
        setPrecioDescuentoEditado(comercio.precioDescuento?.toString() || "");
        setTelefonoEditado(comercio.telefono || "");
        setAliasEditado(comercio.alias || "");

        // Mapear productos
        const productosFormateados = (comercio.productos || []).map(p => ({
          id: p.id || p._id,
          name: p.nombre,
          stock: p.stock,
          weight: p.peso,
          originalPrice: p.precioOriginal,
          discountedPrice: p.precioDescuento,
          imageUrl: undefined, // Por ahora no manejamos imágenes de productos
        }));
        setProductosEditados(productosFormateados);
      } catch (error) {
        console.error("Error cargando comercio:", error);
        toast.error("Error al cargar los datos del comercio");
        setMostrarDialogoSinComercio(true);
      }
    };

    cargarComercio();
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

  const manejarGuardarCampo = async (campo) => {
    if (!datosComercio) return;

    try {
      let datosActualizados = {};

      switch (campo) {
        case "informacion":
          datosActualizados = {
            nombre: nombreEditado,
            rubro: tipoComercioEditado,
            direccion: direccionEditada,
            horarios: horariosEditados,
          };
          break;
        case "descripcion":
          datosActualizados = {
            descripcion: descripcionEditada,
          };
          break;
        case "retiro":
          datosActualizados = {
            horarioRetiro: `${horaRetiroInicio} - ${horaRetiroFin}`,
          };
          break;
        case "precios":
          datosActualizados = {
            precioOriginal: parseFloat(precioOriginalEditado),
            precioDescuento: parseFloat(precioDescuentoEditado),
          };
          break;
        case "contacto":
          datosActualizados = {
            telefono: telefonoEditado,
          };
          break;
        case "alias":
          datosActualizados = {
            alias: aliasEditado,
          };
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

          // Mapear productos al formato de la API
          datosActualizados = {
            productos: productosEditados.map(p => ({
              id: p.id,
              nombre: p.name,
              stock: p.stock,
              peso: p.weight,
              precioOriginal: p.originalPrice,
              precioDescuento: p.discountedPrice,
            })),
          };
          break;
      }

      // Guardar en la API
      const comercioActualizado = await editarComercio(datosComercio._id, datosActualizados);

      // Actualizar estado local
      setDatosComercio(comercioActualizado);

      // Actualizar también los productos editados si se guardaron productos
      if (campo === "productos") {
        const productosFormateados = (comercioActualizado.productos || []).map(p => ({
          id: p.id || p._id,
          name: p.nombre,
          stock: p.stock,
          weight: p.peso,
          originalPrice: p.precioOriginal,
          discountedPrice: p.precioDescuento,
          imageUrl: undefined,
        }));
        setProductosEditados(productosFormateados);
      }

      setCampoEditando(null);
      setProductosExpandidos([]);
      toast.success("Cambios guardados");
    } catch (error) {
      console.error("Error guardando cambios:", error);
      toast.error(error.response?.data?.message || "Error al guardar los cambios");
    }
  };

  const manejarCancelarEdicion = () => {
    if (!datosComercio) return;

    setNombreEditado(datosComercio.nombre || "");
    setTipoComercioEditado(datosComercio.rubro || "");
    setDireccionEditada(datosComercio.direccion || "");
    setDescripcionEditada(datosComercio.descripcion || "");

    const horarioRetiro = datosComercio.horarioRetiro || "18:00 - 20:00";
    const [start, end] = horarioRetiro.split(" - ");
    setHoraRetiroInicio(start || "18:00");
    setHoraRetiroFin(end || "20:00");

    // Restaurar horarios semanales
    const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const horariosIniciales = datosComercio.horarios && datosComercio.horarios.length > 0
      ? datosComercio.horarios
      : DIAS_SEMANA.map(dia => ({
        dia,
        abierto: ["sabado", "domingo"].includes(dia) ? false : true,
        horaApertura: "09:00",
        horaCierre: "18:00",
      }));
    setHorariosEditados(horariosIniciales);

    setPrecioOriginalEditado(datosComercio.precioOriginal?.toString() || "");
    setPrecioDescuentoEditado(datosComercio.precioDescuento?.toString() || "");
    setTelefonoEditado(datosComercio.telefono || "");
    setAliasEditado(datosComercio.alias || "");

    // Mapear productos
    const productosFormateados = (datosComercio.productos || []).map(p => ({
      id: p.id || p._id,
      name: p.nombre,
      stock: p.stock,
      weight: p.peso,
      originalPrice: p.precioOriginal,
      discountedPrice: p.precioDescuento,
      imageUrl: undefined,
    }));
    setProductosEditados(productosFormateados);

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

      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
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

      {/* Mensaje de estado de aprobación */}
      {datosComercio.estadoAprobacion === "pendiente_revision" && (
        <div className="px-4 pt-4 relative z-10">
          <Tarjeta className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Comercio en revisión
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Tu comercio está siendo revisado. En menos de 24 hs recibirás una notificación para completar la información y activarlo.
                </p>
              </div>
            </div>
          </Tarjeta>
        </div>
      )}

      {datosComercio.estadoAprobacion === "rechazado" && (
        <div className="px-4 pt-4 relative z-10">
          <Tarjeta className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <div className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                  Comercio rechazado
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {datosComercio.razonRechazo || "Tu comercio no pudo ser aprobado. Contactá con soporte para más información."}
                </p>
              </div>
            </div>
          </Tarjeta>
        </div>
      )}

      {/* Toggle de activación (solo si está aprobado) */}
      {datosComercio.estadoAprobacion === "aprobado" && (
        <div className="px-4 pt-4 relative z-10">
          <Tarjeta className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Estado del comercio</h3>
                <p className="text-sm text-muted-foreground">
                  {datosComercio.activo
                    ? "Tu comercio está activo y visible en el mapa"
                    : "Tu comercio está inactivo y no aparece en el mapa"}
                </p>
                {!datosComercio.activo && (!datosComercio.productos || datosComercio.productos.length === 0) && (
                  <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
                    Necesitás agregar al menos un producto para poder activar tu comercio
                  </p>
                )}
                {!datosComercio.activo && (!datosComercio.alias || datosComercio.alias.trim() === "") && (
                  <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
                    Necesitás configurar tu alias de Mercado Pago para poder activar tu comercio
                  </p>
                )}
              </div>
              <Boton
                variant={datosComercio.activo ? "destructive" : "default"}
                disabled={
                  !datosComercio.activo &&
                  ((!datosComercio.productos || datosComercio.productos.length === 0) ||
                    (!datosComercio.alias || datosComercio.alias.trim() === ""))
                }
                onClick={async () => {
                  try {
                    const nuevoEstado = !datosComercio.activo;
                    const comercioActualizado = await editarComercio(datosComercio._id, {
                      activo: nuevoEstado,
                    });
                    setDatosComercio(comercioActualizado);
                    toast.success(
                      nuevoEstado
                        ? "Comercio activado exitosamente"
                        : "Comercio desactivado exitosamente"
                    );
                  } catch (error) {
                    console.error("Error cambiando estado:", error);
                    toast.error(error.response?.data?.message || "Error al cambiar el estado del comercio");
                  }
                }}
              >
                {datosComercio.activo ? "Desactivar" : "Activar"}
              </Boton>
            </div>
          </Tarjeta>
        </div>
      )}

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
        />

        {/* Sección de Información General */}
        <Tarjeta className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Información general</h3>
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
                  aria-label="Nombre del comercio"
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
                <Etiqueta>Calle y número del comercio</Etiqueta>
                <AutocompleteDireccion
                  valor={direccionEditada}
                  alCambiar={setDireccionEditada}
                  alSeleccionarLugar={setDireccionEditada}
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  ariaLabel="Calle y número del comercio"
                />
              </div>

              {/* Selector de Horarios Semanales */}
              <SelectorHorarios
                value={horariosEditados}
                onChange={setHorariosEditados}
              />

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
            <div className="space-y-3 text-sm">
              {/* Nombre del comercio */}
              <div>
                <span className="font-medium text-foreground">Nombre del comercio:</span>
                <p className="text-muted-foreground mt-1">{datosComercio.nombre}</p>
              </div>

              {/* Tipo */}
              <div>
                <span className="font-medium text-foreground">Tipo:</span>
                <p className="text-muted-foreground mt-1">
                  {tiposComercio.find(
                    (t) => t.id === datosComercio.rubro
                  )?.label || "No especificado"}
                </p>
              </div>

              {/* Dirección */}
              <div>
                <span className="font-medium text-foreground">Dirección:</span>
                <p className="text-muted-foreground mt-1">{datosComercio.direccion}</p>
              </div>

              {/* Horarios por día */}
              <div>
                <span className="font-medium text-foreground">Horarios de atención:</span>
                <div className="mt-2 space-y-1">
                  {horariosEditados.map((horario) => (
                    <div key={horario.dia} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-muted-foreground">{horario.dia}:</span>
                      <span className="text-muted-foreground">
                        {horario.abierto
                          ? `${horario.horaApertura} - ${horario.horaCierre}`
                          : "Cerrado"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Tarjeta>

        {/* Sección de Alias de Mercado Pago */}
        <Tarjeta className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Alias de Mercado Pago</h3>
            {campoEditando !== "alias" && (
              <Boton
                variant="ghost"
                size="sm"
                onClick={() => setCampoEditando("alias")}
              >
                Editar
              </Boton>
            )}
          </div>

          {campoEditando === "alias" ? (
            <div className="space-y-3">
              <div>
                <Etiqueta>Alias de Mercado Pago</Etiqueta>
                <Entrada
                  value={aliasEditado}
                  onChange={(e) => setAliasEditado(e.target.value)}
                  placeholder="Ej: mi.comercio.mp"
                  aria-label="Alias de Mercado Pago"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresá tu alias de Mercado Pago para recibir los pagos de tus ventas
                </p>
              </div>
              <div className="flex gap-2">
                <Boton
                  size="sm"
                  onClick={() => manejarGuardarCampo("alias")}
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
            <div className="text-sm">
              <span className="font-medium text-foreground">Alias:</span>
              <p className="text-muted-foreground mt-1">
                {datosComercio.alias || "No especificado"}
              </p>
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
                        <span className="sr-only">Eliminar producto</span>
                        <Trash2 className="w-4 h-4" />
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
                              aria-label="Imagen del producto"
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
                            aria-label="Nombre del producto"
                            className="h-8"
                          />
                          {erroresProductos[producto.id]?.name && (
                            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
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
                              aria-label="Stock del producto"
                              className="h-8"
                            />
                            {erroresProductos[producto.id]?.stock && (
                              <p className="text-xs text-red-600 dark:text-red-500 mt-1">
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
                              aria-label="Peso en kilos del producto"
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
                              aria-label="Precio original del producto"
                              className="h-8"
                            />
                            {erroresProductos[producto.id]?.originalPrice && (
                              <p className="text-xs text-red-600 dark:text-red-500 mt-1">
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
                              aria-label="Precio con descuento del producto"
                              className="h-8"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Este es el precio que se cobrara al publico
                            </p>
                            {erroresProductos[producto.id]?.discountedPrice && (
                              <p className="text-xs text-red-600 dark:text-red-500 mt-1">
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
              {datosComercio.productos && datosComercio.productos.length > 0 ? (
                datosComercio.productos.map((producto, index) => (
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
                <Etiqueta>Teléfono de contacto del comercio</Etiqueta>
                <Entrada
                  value={telefonoEditado}
                  onChange={(e) => setTelefonoEditado(e.target.value)}
                  placeholder="Ej: +54 11 1234-5678"
                  aria-label="Teléfono de contacto del comercio"
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
      </div >
    </div >
  );
};

export default EditarComercio;
