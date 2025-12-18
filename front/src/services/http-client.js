import axios from "axios";

const baseURL =
  import.meta.env.DEV
    ? "http://localhost:3000/api"
    : `${import.meta.env.VITE_API_URL}/api` || "/api";

const withBaseConfig = () => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export const http = withBaseConfig();
export const authHttp = withBaseConfig();
