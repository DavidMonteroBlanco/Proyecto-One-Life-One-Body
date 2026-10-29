import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loader route-loader--full" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        Cargando...
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}