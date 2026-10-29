// src/services/api.ts

import axios from "axios";

const api = axios.create({
  // Mismo origen siempre: en el servidor Laravel sirve también el
  // frontend, y en local Vite redirige /api al puerto 8000 (ver
  // vite.config.ts). Antes había aquí una ruta fija a una instalación
  // local que ya no existe, así que en desarrollo no se llegaba a la API.
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  /*
   * 60 segundos, y no 15 como antes.
   *
   * En los planes gratuitos de hosting (Render, Fly) el servidor se
   * duerme a los 15 minutos sin visitas y tarda entre 40 y 60 segundos
   * en despertar. Con 15 segundos, la primera petición del día se
   * cortaba SIEMPRE antes de que el servidor llegara a contestar.
   *
   * Y como axios no deja respuesta cuando se agota el tiempo, la
   * pantalla de acceso lo mostraba como "email o contraseña
   * incorrectos": parecía un problema de credenciales cuando era el
   * servidor levantándose.
   */
  timeout: 60000,
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