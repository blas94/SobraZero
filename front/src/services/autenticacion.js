import { authHttp } from "./http-client";

export async function iniciarSesion(datos) {
  const { data } = await authHttp.post("/auth/login", datos);
  return data;
}

export async function registrarCuenta(datos) {
  const { data } = await authHttp.post("/auth/register", datos);
  return data;
}

export async function obtenerPerfil() {
  const { data } = await authHttp.get("/auth/me");
  return data;
}

export async function actualizarPerfil(datos) {
  const { data } = await authHttp.put("/auth/me", datos);
  return data;
}

export async function cerrarSesion() {
  const { data } = await authHttp.post("/auth/logout");
  return data;
}

export async function verificarSesion() {
  const { data } = await authHttp.get("/auth/verificar");
  return data;
}
