import axios from "axios";

const baseURL =
<<<<<<< HEAD
  import.meta.env.DEV
    ? "http://localhost:3000/api"
    : import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
    "http://localhost:3000/api";
=======
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3000/api";
>>>>>>> c4485221984c1b59f330c839a806751c19be7cd7

const withBaseConfig = () =>
  axios.create({
    baseURL,
  });

export const http = withBaseConfig();
export const authHttp = withBaseConfig();

authHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});
