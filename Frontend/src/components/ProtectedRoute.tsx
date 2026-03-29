import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ color: "var(--primary)", fontFamily: "var(--font-condensed)", letterSpacing: "0.2em" }}>
          CARGANDO...
        </span>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}