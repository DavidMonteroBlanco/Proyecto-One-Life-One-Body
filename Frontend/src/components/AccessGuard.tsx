// src/components/AccessGuard.tsx

import { Navigate } from "react-router-dom";

/**
 * Protege las rutas de auth (login, register, forgot-password).
 * Si el usuario no ha pasado la puerta de acceso, le redirige a /access.
 */
export default function AccessGuard({ children }: { children: React.ReactNode }) {
  const hasAccess = sessionStorage.getItem("olob_access") === "granted";
  return hasAccess ? <>{children}</> : <Navigate to="/access" replace />;
}