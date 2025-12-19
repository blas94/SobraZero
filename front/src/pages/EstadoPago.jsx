import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EstadoPago = () => {
  const navegar = useNavigate();

  useEffect(() => {
    toast.success("Pago procesado. Actualizando pedidos...");
    navegar("/pedidos", { replace: true });
  }, [navegar]);

  return null;
};

export default EstadoPago;
