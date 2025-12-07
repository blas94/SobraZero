import { usarToast } from "@/hooks/usar-toast";
import { Notificacion, CerrarNotificacion, DescripcionNotificacion, ProveedorNotificacion, TituloNotificacion, VistaNotificacion } from "@/components/ui/Notificacion";

const Notificador = () => {
  const { toasts: notificaciones } = usarToast();
  return (<ProveedorNotificacion>
    {notificaciones.map(function ({ id, title, description, action, ...props }) {
      return (<Notificacion key={id} {...props}>
        <div className="grid gap-1">
          {title && <TituloNotificacion>{title}</TituloNotificacion>}
          {description && <DescripcionNotificacion>{description}</DescripcionNotificacion>}
        </div>
        {action}
        <CerrarNotificacion />
      </Notificacion>);
    })}
    <VistaNotificacion />
  </ProveedorNotificacion>);
};

export { Notificador };
