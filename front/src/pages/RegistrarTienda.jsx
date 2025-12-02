import { Boton } from "@/components/ui/boton";
import { Entrada } from "@/components/ui/entrada";
import { Etiqueta } from "@/components/ui/etiqueta";
import { CasillaVerificacion } from "@/components/ui/casilla-verificacion";
import { Tarjeta } from "@/components/ui/tarjeta";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import FormasDecorativas from "@/components/FormasDecorativas";

const esquemaComercio = z.object({
  nombreComercio: z
    .string()
    .min(1, "El nombre del comercio es requerido")
    .max(100),
  tipoComercio: z.string().min(1, "Debés seleccionar un tipo de comercio"),
  direccion: z.string().min(1, "La dirección es requerida").max(200),
  telefono: z.string().min(1, "El celular es requerido").max(20),
  correo: z.string().email("Email inválido"),
  registroLocalVigente: z.boolean().refine((valor) => valor === true, {
    message: "Debés marcar esta opción para continuar",
  }),
  localFisico: z.boolean().refine((valor) => valor === true, {
    message: "Debés marcar esta opción para continuar",
  }),
});

const RegistrarTienda = () => {
  const navegar = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(esquemaComercio),
    defaultValues: {
      nombreComercio: "",
      tipoComercio: "",
      direccion: "",
      telefono: "",
      correo: "",
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

  const manejarEnvio = (datos) => {
    const datosComercio = {
      nombreComercio: datos.nombreComercio,
      tipoComercio: datos.tipoComercio,
      direccion: datos.direccion,
      telefono: datos.telefono,
      correo: datos.correo,
      registroLocalVigente: datos.registroLocalVigente,
      localFisico: datos.localFisico,
      descripcion: "Bolsa sorpresa con productos variados del comercio",
      horarioRetiro: "18:00 - 20:00",
      precioOriginal: 3000,
      precioDescuento: 1000,
      disponibles: 5,
    };

    localStorage.setItem("comercioRegistrado", JSON.stringify(datosComercio));

    toast.success("Solicitud enviada exitosamente. Te contactaremos pronto.");
    navegar("/perfil");
  };

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
                {...register("nombreComercio")}
              />
              {errors.nombreComercio && (
                <p className="text-sm text-destructive">
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
                <p className="text-sm text-destructive">
                  {errors.tipoComercio.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Etiqueta htmlFor="direccion">Dirección y número del comercio</Etiqueta>
              <Entrada
                id="direccion"
                type="text"
                placeholder="Ingresá la dirección y el número de tu comercio"
                {...register("direccion")}
              />
              <p className="text-xs text-muted-foreground">
                Solo direcciones dentro de Capital Federal, Buenos Aires,
                Argentina
              </p>
              {errors.direccion && (
                <p className="text-sm text-destructive">
                  {errors.direccion.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Etiqueta htmlFor="telefono">Número de celular</Etiqueta>
              <Entrada
                id="telefono"
                type="tel"
                placeholder="Ingresá tu número de celular"
                {...register("telefono")}
              />
              {errors.telefono && (
                <p className="text-sm text-destructive">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Etiqueta htmlFor="correo">
                Email con el que accedés a SobraZero
              </Etiqueta>
              <Entrada
                id="correo"
                type="email"
                placeholder="Ingresá tu email"
                {...register("correo")}
              />
              {errors.correo && (
                <p className="text-sm text-destructive">
                  {errors.correo.message}
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
                  <p className="text-sm text-destructive ml-7">
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
                  <p className="text-sm text-destructive ml-7">
                    {errors.localFisico.message}
                  </p>
                )}
              </div>
            </div>

            <Boton type="submit" size="lg" className="w-full">
              Registrar mi comercio
            </Boton>
          </form>
        </Tarjeta>
      </main>
    </div>
  );
};

export default RegistrarTienda;
