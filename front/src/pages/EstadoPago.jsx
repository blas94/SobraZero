import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EstadoPago = () => {
  const navegar = useNavigate();

  useEffect(() => {
    toast.success("Pago procesado. Actualizando pedidos...");

    sessionStorage.setItem("sobrazero_refetch_pedidos", "1");

    navegar("/pedidos", { replace: true });
  }, [navegar]);

  return null;
};

export default EstadoPago;
