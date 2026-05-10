// src/services/api.ts

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost/One_Life_One_Body/Backend/public/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 segundos máximo por petición (evita que se quede colgado)
});

// Inyecta el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo de errores de respuesta
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      // Token expirado o inválido — limpiar y redirigir al login
      localStorage.removeItem("token");
      // Solo redirigir si no estamos ya en una página pública
      if (window.location.pathname.startsWith("/admin") ||
          window.location.pathname.startsWith("/dashboard") ||
          window.location.pathname.startsWith("/my-")) {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      window.location.href = "/forbidden";
    }

    return Promise.reject(err);
  }
);

export default api;