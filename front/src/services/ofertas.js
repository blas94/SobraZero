import { authHttp } from "./http-client";

export async function obtenerOfertaPorId(idOferta) {
  const { data } = await authHttp.get(`/ofertas/${idOferta}`);
  return data;
}
