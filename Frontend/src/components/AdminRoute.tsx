import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
}