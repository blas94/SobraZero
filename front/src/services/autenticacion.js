import { authHttp } from "./http-client";

export async function iniciarSesion(datos) {
  const { data } = await authHttp.post("/auth/login", datos);
  return data;
}

export async function marcarTutorialVisto() {
  const { data } = await authHttp.post("/auth/tutorial");
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

export const recuperarPassword = async (email) => {
  const { data } = await authHttp.post("/auth/forgot-password", { email });
  return data;
};

export const restablecerPassword = async (token, newPassword) => {
  const { data } = await authHttp.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return data;
};

export const solicitarCambioEmail = async (newEmail) => {
  const { data } = await authHttp.post("/auth/request-email-change", {
    newEmail,
  });
  return data;
};

export const verificarCambioEmail = async (token) => {
  const { data } = await authHttp.post("/auth/verify-email-change", {
    token,
  });
  return data;
};
