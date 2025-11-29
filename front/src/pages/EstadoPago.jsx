import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authHttp } from "@/services/http-client";

const EstadoPago = () => {
  const navegar = useNavigate();
  const { search } = useLocation();
  const parametros = useMemo(() => new URLSearchParams(search), [search]);

  const estadoPago = (parametros.get("status") || "").toLowerCase();
  const reservaId = parametros.get("reserva");
  const esSimulado = parametros.get("simulated") === "1";

  const [reserva, setReserva] = useState(null);

  useEffect(() => {
    const obtenerReserva = async () => {
      try {
        if (!reservaId) return;
        const { data } = await authHttp.get(`/reservas/${reservaId}`);
        setReserva(data);
      } catch { }
    };
    obtenerReserva();
  }, [reservaId]);

  useEffect(() => {
    if (estadoPago === "success") {
      toast.success("Tu pago se realizó con éxito.");
      const temporizador = setTimeout(
        () => navegar("/pedidos", { replace: true }),
        3000
      );
      return () => clearTimeout(temporizador);
    }

    if (estadoPago) {
      toast.error("No pudimos confirmar el pago.");
    }
  }, [estadoPago, navegar]);

  const titulo =
    estadoPago === "success"
      ? "Pago aprobado"
      : estadoPago === "pending"
        ? "Pago pendiente"
        : estadoPago === "failure"
          ? "Pago rechazado"
          : "Estado desconocido";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Estado del pago</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {titulo} {esSimulado && "(modo simulado)"}
      </p>

      {reserva && (
        <pre className="bg-muted/40 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(reserva, null, 2)}
        </pre>
      )}

      <div className="mt-6 flex gap-3">
        <button
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
          onClick={() => navegar("/pedidos")}
        >
          Ir a mis pedidos
        </button>
        <button
          className="px-4 py-2 rounded-md border"
          onClick={() => navegar("/")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default EstadoPago;
