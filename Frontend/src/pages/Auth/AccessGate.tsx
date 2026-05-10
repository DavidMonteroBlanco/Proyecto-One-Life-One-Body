// src/pages/Auth/AccessGate.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./Auth.css";

const ACCESS_CODE = "DIVA";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

export default function AccessGate() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.trim().toUpperCase() === ACCESS_CODE) {
      setSuccess(true);
      localStorage.setItem("olob_access", "granted");
      setTimeout(() => navigate("/login"), 600);
    } else {
      setError("Código incorrecto. Contacta con tu entrenador para obtenerlo.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
      </div>

      <div className="auth-container">
        <motion.div className="auth-card" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className="auth-card__bg-logo">
            <img src={logoImg} alt="" aria-hidden="true" />
          </div>

          <div className="auth-card__header">
            <p className="section-label">Acceso privado</p>
            <h1 className="auth-card__title">Area cliente</h1>
            <p className="auth-card__sub">
              Para acceder necesitas el código que te proporciona tu entrenador.
            </p>
          </div>

          {!success ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="access-code">Código de acceso</label>
                <input
                  id="access-code"
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                  placeholder="Introduce tu código"
                  autoComplete="off"
                  className="access-code-input"
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn-primary auth-submit">
                Verificar código
              </button>
            </form>
          ) : (
            <div className="auth-form" style={{ alignItems: "center", padding: "2rem 2.4rem" }}>
              <div className="auth-success-icon">✓</div>
              <p style={{ color: "var(--primary)", fontFamily: "var(--font-condensed)", letterSpacing: "0.08em" }}>
                Acceso concedido
              </p>
            </div>
          )}

          <div className="auth-card__footer">
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center", lineHeight: "1.5" }}>
              Si no tienes código, contacta con David por Instagram o en el centro de Benidorm.
            </p>
            <a href="/" className="auth-back">← Volver a la web</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}