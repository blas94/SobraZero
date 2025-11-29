import { authHttp } from "./http-client";

export async function crearReserva(params) {
  const { usuarioId, ofertaId, productoNombre, cantidad } = params;

  const res = await authHttp.post("/reservas", {
    usuarioId,
    ofertaId,
    productoNombre,
    cantidad,
  });

  return res.data;
}
