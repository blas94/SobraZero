import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "");

const normalizar = (url = "") => String(url || "").replace(/\/+$/, "");

const baseURL = API_BASE ? `${normalizar(API_BASE)}/api` : "/api";

const withBaseConfig = () => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return instance;
};

export const http = withBaseConfig();
export const authHttp = withBaseConfig();
