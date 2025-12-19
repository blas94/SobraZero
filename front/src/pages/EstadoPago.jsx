import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EstadoPago = () => {
  const navegar = useNavigate();
  const { search } = useLocation();
  const parametros = useMemo(() => new URLSearchParams(search), [search]);

  const estadoPago = (parametros.get("status") || "").toLowerCase();

  useEffect(() => {
    if (estadoPago === "success") toast.success("Pago aprobado.");
    else if (estadoPago === "pending") toast.message("Pago pendiente.");
    else if (estadoPago === "failure") toast.error("Pago rechazado.");
    else if (estadoPago) toast.error("No pudimos confirmar el pago.");

    navegar("/pedidos", { replace: true });
  }, [estadoPago, navegar]);

  return null;
};

export default EstadoPago;