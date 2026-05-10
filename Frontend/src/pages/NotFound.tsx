// src/pages/NotFound.tsx

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg-deep)", color: "var(--text-primary)",
      textAlign: "center", padding: "2rem",
    }}>
      <span style={{
        fontFamily: "var(--font-display)", fontSize: "clamp(8rem, 20vw, 14rem)",
        color: "var(--primary)", lineHeight: 1, opacity: 0.15,
      }}>404</span>
      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 3rem)",
        letterSpacing: "0.06em", marginTop: "-1rem",
      }}>Pagina no encontrada</h1>
      <p style={{
        fontFamily: "var(--font-condensed)", fontSize: "1rem",
        color: "var(--text-muted)", marginTop: "0.5rem", maxWidth: 400,
        lineHeight: 1.6,
      }}>
        La pagina que buscas no existe o ha sido movida.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/" className="btn-primary">Ir al inicio</Link>
        <Link to="/dashboard" className="btn-ghost">Mi dashboard</Link>
      </div>
    </div>
  );
}