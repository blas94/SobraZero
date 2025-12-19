import { Boton } from "@/components/ui/Boton";
import { Entrada } from "@/components/ui/Entrada";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { CasillaVerificacion } from "@/components/ui/CasillaVerificacion";
import { Tarjeta } from "@/components/ui/Tarjeta";
import AutocompleteDireccion from "@/components/AutocompleteDireccion";
import SelectorHorarios from "@/components/SelectorHorarios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import FormasDecorativas from "@/components/FormasDecorativas";
import { registrarComercio } from "@/services/comercios";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usarNotificaciones } from "@/hooks/usar-notificaciones";

const esquemaComercio = z.object({
  nombreComercio: z
    .string()
    .min(1, "El nombre del comercio es requerido")
    .max(100),
  tipoComercio: z.string().min(1, "Debés seleccionar un tipo de comercio"),
  direccion: z
    .string()
    .min(1, "La dirección es requerida")
    .max(200)
    .refine(
      (valor) => {
        // Verificar que tenga al menos un número en la primera parte (antes de la primera coma)
        // Esto evita que el código postal sea detectado como número de calle
        const primeraParteConNumero = /^[^,]*\d/.test(valor);
        return primeraParteConNumero;
      },
      {
        message: "La dirección debe incluir el número de la calle",
      }
    ),
  horarios: z
    .array(
      z.object({
        dia: z.string(),
        abierto: z.boolean(),
        horaApertura: z.string().optional(),
        horaCierre: z.string().optional(),
      })
    )
    .min(1, "Debés configurar al menos un día")
    .refine(
      (horarios) => {
        // Verificar que al menos un día esté abierto
        return horarios.some((h) => h.abierto);
      },
      {
        message: "Debés tener al menos un día abierto",
      }
    )
    .refine(
      (horarios) => {
        // Verificar que los días abiertos tengan horarios
        return horarios.every((h) => {
          if (!h.abierto) return true;
          return h.horaApertura && h.horaCierre;
        });
      },
      {
        message: "Los días abiertos deben tener horarios de apertura y cierre",
      }
    ),
  telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .refine(
      (valor) => {
        // Eliminar espacios, guiones y paréntesis para contar solo dígitos
        const soloDigitos = valor.replace(/[\s\-()]/g, "");
        return soloDigitos.length >= 10;
      },
      {
        message: "El teléfono debe tener al menos 10 dígitos",
      }
    ),
  alias: z.string().optional(),
  registroLocalVigente: z.boolean().refine((valor) => valor === true, {
    message: "Debés marcar esta opción para continuar",
  }),
  localFisico: z.boolean().refine((valor) => valor === true, {
    message: "Debés marcar esta opción para continuar",
  }),
});



const RegistrarComercio = () => {
  const navegar = useNavigate();
  const [cargando, setCargando] = useState(false);
  const { usuario } = useAuth();
  const { agregarNotificacion } = usarNotificaciones(usuario?.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    resolver: zodResolver(esquemaComercio),
    defaultValues: {
      nombreComercio: "",
      tipoComercio: "",
      direccion: "",
      horarios: [
        { dia: "lunes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
        { dia: "martes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
        { dia: "miercoles", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
        { dia: "jueves", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
        { dia: "viernes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
        { dia: "sabado", abierto: false, horaApertura: "09:00", horaCierre: "18:00" },
        { dia: "domingo", abierto: false, horaApertura: "09:00", horaCierre: "18:00" },
      ],
      alias: "",
      telefono: "",
      registroLocalVigente: false,
      localFisico: false,
    },
  });

  const registroLocalVigente = watch("registroLocalVigente");
  const localFisico = watch("localFisico");
  const tipoComercioSeleccionado = watch("tipoComercio");

  const tiposComercio = [
    { id: "panaderia", label: "Panadería" },
    { id: "supermercado", label: "Supermercado" },
    { id: "verduleria", label: "Verdulería" },
    { id: "restaurante", label: "Restaurante" },
  ];

  const manejarEnvio = async (datos) => {
    setCargando(true);

    try {
      const datosComercio = {
        nombre: datos.nombreComercio,
        rubro: datos.tipoComercio,
        direccion: datos.direccion,
        horarios: datos.horarios,
        alias: datos.alias,
        telefono: datos.telefono,
      };

      await registrarComercio(datosComercio);

      // Crear notificación de éxito
      agregarNotificacion({
        titulo: "Comercio Registrado",
        descripcion: `Tu comercio "${datos.nombreComercio}" está siendo revisado`,
        tipo: 'business'
      });

      toast.success(
        "Tu comercio está siendo revisado. En menos de 24 hs recibirás una notificación para completar la información",
        { duration: 5000 }
      );

      // Redirigir al perfil
      setTimeout(() => navegar("/perfil"), 2000);
    } catch (error) {
      console.error("Error:", error);

      // Manejar error específico de comercio ya registrado
      if (error.response?.data?.message?.includes("Ya tenés un comercio registrado")) {
        toast.error("Ya tenés un comercio registrado");
      } else {
        toast.error(error.response?.data?.message || "Error al registrar el comercio");
      }
    } finally {
      setCargando(false);
    }
  };

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
          <h1 className="text-2xl font-bold">Registrá tu comercio</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 relative z-10">
        <Tarjeta className="p-6">
          <form onSubmit={handleSubmit(manejarEnvio)} className="space-y-6">
            <div className="space-y-2">
              <Etiqueta htmlFor="nombreComercio">Nombre del comercio</Etiqueta>
              <Entrada
                id="nombreComercio"
                type="text"
                placeholder="Ingresá el nombre de tu comercio"
                aria-label="Nombre del comercio"
                {...register("nombreComercio")}
              />
              {errors.nombreComercio && (
                <p className="text-sm text-red-600 dark:text-red-500">
                  {errors.nombreComercio.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Etiqueta>Tipo de comercio</Etiqueta>
              <div className="grid grid-cols-2 gap-3">
                {tiposComercio.map((tipo) => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() =>
                      setValue("tipoComercio", tipo.id, {
                        shouldValidate: true,
                      })
                    }
                    className={`p-3 rounded-lg border-2 transition-all ${tipoComercioSeleccionado === tipo.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <span className="font-medium">{tipo.label}</span>
                  </button>
                ))}
              </div>
              {errors.tipoComercio && (
                <p className="text-sm text-red-600 dark:text-red-500">
                  {errors.tipoComercio.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Etiqueta htmlFor="direccion">Dirección exacta del comercio</Etiqueta>
              <AutocompleteDireccion
                valor={watch("direccion")}
                alCambiar={(valor) => setValue("direccion", valor, { shouldValidate: true })}
                alSeleccionarLugar={(direccion) => {
                  setValue("direccion", direccion, { shouldValidate: true });
                }}
                placeholder="Ej: Av. Corrientes 1234"
                ariaLabel="Dirección exacta del comercio"
                error={errors.direccion?.message}
              />
              <p className="text-xs text-muted-foreground">
                Solo direcciones dentro de Capital Federal, Buenos Aires,
                Argentina
              </p>
              {errors.direccion && (
                <p className="text-sm text-red-600 dark:text-red-500">
                  {errors.direccion.message}
                </p>
              )}
            </div>

            {/* Selector de Horarios */}
            <Controller
              name="horarios"
              control={control}
              render={({ field }) => (
                <SelectorHorarios
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.horarios?.message}
                />
              )}
            />

            {/* Alias de Mercado Pago */}
            <div className="space-y-2">
              <Etiqueta htmlFor="alias">Alias de Mercado Pago</Etiqueta>
              <Entrada
                id="alias"
                type="text"
                placeholder="Ej: mi.comercio.mp"
                aria-label="Alias de Mercado Pago"
                {...register("alias")}
              />
              <p className="text-xs text-muted-foreground">
                Ingresá tu alias de Mercado Pago para recibir los pagos de tus ventas
              </p>
              {errors.alias && (
                <p className="text-sm text-red-600 dark:text-red-500">
                  {errors.alias.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Etiqueta htmlFor="telefono">Teléfono de contacto del comercio</Etiqueta>
              <Entrada
                id="telefono"
                type="tel"
                placeholder="Ej: +54 11 1234-5678"
                aria-label="Teléfono de contacto del comercio"
                {...register("telefono")}
              />
              <p className="text-xs text-muted-foreground">
                Este teléfono servirá únicamente para uso administrativo y de soporte
              </p>
              {errors.telefono && (
                <p className="text-sm text-red-600 dark:text-red-500">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CasillaVerificacion
                    id="registroLocalVigente"
                    checked={registroLocalVigente}
                    onCheckedChange={(checked) =>
                      setValue("registroLocalVigente", checked, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <label
                    htmlFor="registroLocalVigente"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    Cuento con una empresa con registro local vigente
                  </label>
                </div>
                {errors.registroLocalVigente && (
                  <p className="text-sm text-red-600 dark:text-red-500 ml-7">
                    {errors.registroLocalVigente.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CasillaVerificacion
                    id="localFisico"
                    checked={localFisico}
                    onCheckedChange={(checked) =>
                      setValue("localFisico", checked, { shouldValidate: true })
                    }
                  />
                  <label
                    htmlFor="localFisico"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    Cuento con un local físico abierto al público
                  </label>
                </div>
                {errors.localFisico && (
                  <p className="text-sm text-red-600 dark:text-red-500 ml-7">
                    {errors.localFisico.message}
                  </p>
                )}
              </div>
            </div>

            <Boton type="submit" size="lg" className="w-full" disabled={cargando}>
              {cargando ? "Registrando..." : "Registrar mi comercio"}
            </Boton>
          </form>
        </Tarjeta>
      </main>
    </div>
  );
};

export default RegistrarComercio;
