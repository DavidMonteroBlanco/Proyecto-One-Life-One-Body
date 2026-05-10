// src/pages/Forbidden.tsx

import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg-deep)", color: "var(--text-primary)",
      textAlign: "center", padding: "2rem",
    }}>
      <span style={{
        fontFamily: "var(--font-display)", fontSize: "clamp(8rem, 20vw, 14rem)",
        color: "#fca5a5", lineHeight: 1, opacity: 0.15,
      }}>403</span>
      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 3rem)",
        letterSpacing: "0.06em", marginTop: "-1rem",
      }}>Acceso denegado</h1>
      <p style={{
        fontFamily: "var(--font-condensed)", fontSize: "1rem",
        color: "var(--text-muted)", marginTop: "0.5rem", maxWidth: 400,
        lineHeight: 1.6,
      }}>
        No tienes permisos para acceder a esta seccion. Si crees que es un error, contacta con tu entrenador.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/dashboard" className="btn-primary">Mi dashboard</Link>
        <Link to="/" className="btn-ghost">Ir al inicio</Link>
      </div>
    </div>
  );
}