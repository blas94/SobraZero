import { authHttp } from "./http-client";

export async function crearReserva(params) {
  const { usuarioId, comercioId, productoNombre, cantidad } = params;

  const res = await authHttp.post("/reservas", {
    usuarioId,
    comercioId,
    productoNombre,
    cantidad,
  });

  return res.data;
}

/**
 * Obtiene las reservas del usuario autenticado
 * @returns {Promise<Array>} Array de reservas del usuario
 */
export async function obtenerMisReservas() {
  const { data } = await authHttp.get("/reservas/mis-reservas");
  return data;
}

/**
 * Cancela una reserva específica
 * @param {string} idReserva - ID de la reserva a cancelar
 * @returns {Promise<Object>} Confirmación de cancelación
 */
export async function cancelarReserva(idReserva) {
  const { data } = await authHttp.delete(`/reservas/${idReserva}`);
  return data;
}
