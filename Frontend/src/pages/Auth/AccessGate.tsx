// src/pages/Auth/AccessGate.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/icons/logo-bw.jpg";
import Icon from "../../components/ui/Icon";
import "./Auth.css";

const ACCESS_CODE = "DIVA";

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
        <div className="auth-card rise rise--1">
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
            <div className="auth-form auth-form--centered">
              <div className="auth-success-icon"><Icon name="check" size={28} strokeWidth={2} /></div>
              <p className="auth-status">Acceso concedido</p>
            </div>
          )}

          <div className="auth-card__footer">
            <p className="auth-hint">
              Si no tienes código, contacta con David por Instagram o en el centro de Benidorm.
            </p>
            <a href="/" className="auth-back"><Icon name="arrow-left" size={13} /> Volver a la web</a>
          </div>
        </div>
      </div>
    </div>
  );
}