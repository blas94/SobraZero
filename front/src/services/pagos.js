import { authHttp } from "./http-client";

export async function crearPreferencia(cuerpo) {
  const { data } = await authHttp.post("/pagos/crear-preferencia", cuerpo);
  return data;
}
