import axios from "axios";

const baseURL =
  import.meta.env.DEV
    ? "http://localhost:3000/api"
    : import.meta.env.VITE_API_URL || "/api";

const withBaseConfig = () =>
  axios.create({
    baseURL,
    withCredentials: true, // Enviar cookies automáticamente
    headers: {
      "Content-Type": "application/json",
    },
  });

export const http = withBaseConfig();
export const authHttp = withBaseConfig();

// Ya no necesitamos interceptor - la cookie se envía automáticamente
