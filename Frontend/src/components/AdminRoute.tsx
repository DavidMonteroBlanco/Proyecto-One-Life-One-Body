// src/components/AdminRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  return isAdmin ? <>{children}</> : <Navigate to="/forbidden" replace />;
}