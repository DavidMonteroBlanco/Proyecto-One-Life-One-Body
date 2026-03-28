import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../auth";

export default function AdminRoute({ children }: { children: ReactNode }) {
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}
