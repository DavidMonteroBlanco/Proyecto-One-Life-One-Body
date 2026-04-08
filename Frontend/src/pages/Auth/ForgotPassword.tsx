// src/pages/Auth/ForgotPassword.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import api from "../../services/api";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./Auth.css";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

type Step = "email" | "code" | "success";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── Solicitar código ── */
  const handleRequestCode = async () => {
    if (!email) { setMsg({ type: "err", text: "Introduce tu email." }); return; }
    setLoading(true);
    setMsg(null);
    try {
      await api.post("/forgot-password/request-code", { email });
      setStep("code");
      setCountdown(60);
      setMsg({ type: "ok", text: "Si el email existe, recibirás un código de verificación." });
    } catch (err: any) {
      setMsg({ type: "err", text: err?.response?.data?.message || "Error al enviar. Inténtalo de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  /* ── Verificar código y cambiar contraseña ── */
  const handleResetPassword = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) { setMsg({ type: "err", text: "Introduce el código completo." }); return; }
    if (newPassword.length < 8) { setMsg({ type: "err", text: "Mínimo 8 caracteres." }); return; }
    if (newPassword !== confirmPassword) { setMsg({ type: "err", text: "Las contraseñas no coinciden." }); return; }

    setLoading(true);
    setMsg(null);
    try {
      await api.post("/forgot-password/reset", {
        email,
        code,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setStep("success");
      setMsg({ type: "ok", text: "Contraseña cambiada. Ya puedes iniciar sesión." });
    } catch (err: any) {
      setMsg({ type: "err", text: err?.response?.data?.message || "Código incorrecto o expirado." });
    } finally {
      setLoading(false);
    }
  };

  /* ── Inputs OTP ── */
  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...verificationCode];
    next[index] = value;
    setVerificationCode(next);
    if (value && index < 5) document.getElementById(`fc-${index + 1}`)?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      document.getElementById(`fc-${index - 1}`)?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...verificationCode];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setVerificationCode(next);
    document.getElementById(`fc-${Math.min(pasted.length, 5)}`)?.focus();
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

          <div className="auth-card__header" key={step}>
            <p className="section-label">Recuperar acceso</p>
            {step === "success" ? (
              <h1 className="auth-card__title">Listo</h1>
            ) : (
              <h1 className="auth-card__title">Recupera tu<br />cuenta</h1>
            )}
            {step === "email" && (
              <p className="auth-card__sub">Introduce tu email y te enviaremos un código para restablecer tu contraseña.</p>
            )}
            {step === "code" && (
              <p className="auth-card__sub">Introduce el código que te hemos enviado y tu nueva contraseña.</p>
            )}
            {step === "success" && (
              <p className="auth-card__sub">Tu contraseña ha sido cambiada correctamente.</p>
            )}
          </div>

          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <div className="auth-form">
              <div className="auth-field">
                <label htmlFor="fp-email">Email</label>
                <input id="fp-email" type="email" autoComplete="email"
                  placeholder="tu@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setMsg(null); }} required />
              </div>

              {msg && <p className={`auth-${msg.type === "ok" ? "success" : "error"}`}>{msg.text}</p>}

              <button className={`btn-primary auth-submit ${loading ? "loading" : ""}`}
                onClick={handleRequestCode} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Enviar código"}
              </button>
            </div>
          )}

          {/* ── STEP 2: Code + New password ── */}
          {step === "code" && (
            <div className="auth-form">
              {msg && <p className={`auth-${msg.type === "ok" ? "success" : "error"}`}>{msg.text}</p>}

              <div className="auth-field">
                <label>Código de verificación</label>
                <div className="auth-code-inputs" onPaste={handleCodePaste}>
                  {verificationCode.map((digit, i) => (
                    <input key={i} id={`fc-${i}`} type="text" inputMode="numeric"
                      maxLength={1} value={digit}
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="auth-code-input" autoFocus={i === 0} />
                  ))}
                </div>
                <div className="auth-code-actions">
                  {countdown > 0 ? (
                    <span className="auth-code-countdown">Reenviar en {countdown}s</span>
                  ) : (
                    <button type="button" className="auth-code-resend" onClick={handleRequestCode} disabled={loading}>
                      Reenviar código
                    </button>
                  )}
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="fp-pw">Nueva contraseña</label>
                <input id="fp-pw" type="password" autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
              </div>

              <div className="auth-field">
                <label htmlFor="fp-pw2">Confirmar contraseña</label>
                <input id="fp-pw2" type="password" autoComplete="new-password"
                  placeholder="Repite la contraseña" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required />
                {confirmPassword.length > 0 && (
                  <span className={`pw-match ${newPassword === confirmPassword ? "ok" : "fail"}`}>
                    {newPassword === confirmPassword ? "✓ Coinciden" : "✗ No coinciden"}
                  </span>
                )}
              </div>

              <button className={`btn-primary auth-submit ${loading ? "loading" : ""}`}
                onClick={handleResetPassword} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Cambiar contraseña"}
              </button>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === "success" && (
            <div className="auth-form" style={{ alignItems: "center", padding: "1.5rem 2.4rem 2rem" }}>
              <div className="auth-success-icon">✓</div>
              <button className="btn-primary auth-submit" onClick={() => navigate("/login")}>
                Ir a iniciar sesión
              </button>
            </div>
          )}

          <div className="auth-card__footer">
            <Link to="/login" className="auth-back">← Volver al login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}