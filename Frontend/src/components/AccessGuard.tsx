// src/components/AccessGuard.tsx

import { Navigate } from "react-router-dom";

export default function AccessGuard({ children }: { children: React.ReactNode }) {
  const hasAccess = localStorage.getItem("olob_access") === "granted";
  return hasAccess ? <>{children}</> : <Navigate to="/access" replace />;
}