import { authHttp } from "./http-client";

export const iniciarSesion = async (data) => {
  const res = await authHttp.post("/auth/login", data);
  if (res.data?.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
};

export async function marcarTutorialVisto() {
  const { data } = await authHttp.post("/auth/tutorial");
  return data;
}
export async function registrarPasoTutorial(paso) {
  const { data } = await authHttp.post("/auth/tutorial/paso", { paso });
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

export const cerrarSesion = async () => {
  localStorage.removeItem("token");
  await authHttp.post("/auth/logout");
};

export const usuarioActual = async () => {
  const res = await authHttp.get("/auth/me");
  return res.data;
};

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
