import { authHttp } from "./http-client";

export const USUARIO_PRUEBA_ID = "68c637445ceb927c5a2fc14c";

const normalizarPayloadTarjeta = (datosTarjeta) => ({
  usuarioId: datosTarjeta.usuarioId || USUARIO_PRUEBA_ID,
  alias: datosTarjeta.alias,
  marca: datosTarjeta.marca,
  ultimos4: datosTarjeta.ultimos4,
  esPrincipal: datosTarjeta.esPrincipal,
});

export async function obtenerTarjetasGuardadas(usuarioId = USUARIO_PRUEBA_ID) {
  const { data } = await authHttp.get(`/tarjetas/${usuarioId}`);
  return data;
}

export async function agregarTarjeta(datosTarjeta) {
  const { data } = await authHttp.post(
    "/tarjetas",
    normalizarPayloadTarjeta(datosTarjeta)
  );
  return data;
}

export async function eliminarTarjeta(idTarjeta) {
  await authHttp.delete(`/tarjetas/${idTarjeta}`);
}

export async function establecerTarjetaPrincipal(idTarjeta) {
  const { data } = await authHttp.patch(`/tarjetas/${idTarjeta}/principal`);
  return data;
}

export const obtenerTarjetaPrincipal = async (
  usuarioId = USUARIO_PRUEBA_ID
) => {
  const tarjetas = await obtenerTarjetasGuardadas(usuarioId);

  if (!Array.isArray(tarjetas) || tarjetas.length === 0) return null;

  const principal = tarjetas.find((t) => t.esPrincipal === true);
  return principal || tarjetas[0];
};
