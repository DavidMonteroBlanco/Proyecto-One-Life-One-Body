// src/pages/user/Profile.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../services/api";
import "./Profile.css";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  birth_date: string;
};

type PasswordStep = "idle" | "sending" | "code" | "success";

export default function Profile() {
  const { user, setUser } = useAuth();

  /* ── Perfil ── */
  const [profile, setProfile] = useState<ProfileData>({
    name: "", email: "", phone: "", birth_date: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* ── Cambio de contraseña ── */
  const [pwStep, setPwStep] = useState<PasswordStep>("idle");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  /* ── Cargar datos ── */
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        birth_date: (user as any).birth_date || "",
      });
    }
  }, [user]);

  /* ── Countdown reenvío ── */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ══ GUARDAR PERFIL ══ */
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const { data } = await api.put("/me/profile", {
        name: profile.name,
        phone: profile.phone,
        birth_date: profile.birth_date,
      });
      setUser(data.user);
      setProfileMsg({ type: "ok", text: "Perfil actualizado correctamente." });
    } catch (err: any) {
      setProfileMsg({ type: "err", text: err?.response?.data?.message || "Error al guardar." });
    } finally {
      setProfileLoading(false);
    }
  };

  /* ══ SOLICITAR CÓDIGO ══ */
  const handleRequestCode = async () => {
    setPwLoading(true);
    setPwMsg(null);
    try {
      await api.post("/me/password/request-code", { method: "email" });
      setPwStep("code");
      setCountdown(60);
      setPwMsg({ type: "ok", text: `Código enviado a ${maskEmail(profile.email)}` });
    } catch (err: any) {
      setPwMsg({ type: "err", text: err?.response?.data?.message || "Error al enviar el código." });
      setPwStep("idle");
    } finally {
      setPwLoading(false);
    }
  };

  /* ══ CAMBIAR CONTRASEÑA ══ */
  const handleChangePassword = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setPwMsg({ type: "err", text: "Introduce el código de 6 dígitos completo." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: "err", text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "err", text: "Las contraseñas no coinciden." });
      return;
    }

    setPwLoading(true);
    setPwMsg(null);
    try {
      await api.post("/me/password/change", {
        code,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPwStep("success");
      setPwMsg({ type: "ok", text: "Contraseña cambiada correctamente." });
      setNewPassword("");
      setConfirmPassword("");
      setVerificationCode(["", "", "", "", "", ""]);
      setTimeout(() => { setPwStep("idle"); setPwMsg(null); }, 4000);
    } catch (err: any) {
      setPwMsg({ type: "err", text: err?.response?.data?.message || "Código incorrecto o expirado." });
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Inputs del código OTP ── */
  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...verificationCode];
    next[index] = value;
    setVerificationCode(next);
    if (value && index < 5) document.getElementById(`code-${index + 1}`)?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...verificationCode];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setVerificationCode(next);
    document.getElementById(`code-${Math.min(pasted.length, 5)}`)?.focus();
  };

  const maskEmail = (email: string) => {
    const [u, d] = email.split("@");
    if (!u || !d) return "***@***";
    return u[0] + "•••" + (u.length > 1 ? u.slice(-1) : "") + "@" + d;
  };

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">Mi Perfil</h1>
        <p className="profile-page__sub">Gestiona tu información personal y seguridad</p>
      </div>

      <div className="profile-grid">

        {/* ══ DATOS PERSONALES ══ */}
        <section className="profile-card">
          <div className="profile-card__header">
            <span className="profile-card__icon">◈</span>
            <div>
              <h2 className="profile-card__title">Datos personales</h2>
              <p className="profile-card__desc">Tu información básica de cuenta</p>
            </div>
          </div>

          <div className="profile-form">
            <div className="profile-field">
              <label>Nombre completo</label>
              <input type="text" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Tu nombre" />
            </div>

            <div className="profile-field">
              <label>Email</label>
              <input type="email" value={profile.email} disabled className="profile-field--disabled" />
              <span className="profile-field__hint">El email no se puede cambiar</span>
            </div>

            <div className="profile-field">
              <label>Teléfono</label>
              <input type="tel" value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+34 600 000 000" />
            </div>

            <div className="profile-field">
              <label>Fecha de nacimiento</label>
              <input type="date" value={profile.birth_date}
                onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })} />
            </div>

            {profileMsg && (
              <div className={`profile-msg profile-msg--${profileMsg.type}`}>
                {profileMsg.type === "ok" ? "✓" : "✗"} {profileMsg.text}
              </div>
            )}

            <button className="profile-btn profile-btn--primary"
              onClick={handleSaveProfile} disabled={profileLoading}>
              {profileLoading ? <span className="profile-spinner" /> : "Guardar cambios"}
            </button>
          </div>
        </section>

        {/* ══ SEGURIDAD ══ */}
        <section className="profile-card">
          <div className="profile-card__header">
            <span className="profile-card__icon profile-card__icon--security">◉</span>
            <div>
              <h2 className="profile-card__title">Seguridad</h2>
              <p className="profile-card__desc">Cambia tu contraseña de forma segura</p>
            </div>
          </div>

          {/* IDLE: botón para solicitar código */}
          {pwStep === "idle" && (
            <div className="profile-form">
              <p className="pw-intro">
                Para cambiar tu contraseña te enviaremos un <strong>código de 6 dígitos</strong> a tu email registrado.
              </p>

              <div className="pw-email-preview">
                <span className="pw-email-preview__icon">✉</span>
                <div className="pw-email-preview__text">
                  <strong>Se enviará a:</strong>
                  <span>{maskEmail(profile.email)}</span>
                </div>
              </div>

              {pwMsg && (
                <div className={`profile-msg profile-msg--${pwMsg.type}`}>{pwMsg.text}</div>
              )}

              <button className="profile-btn profile-btn--primary"
                onClick={() => { setPwStep("sending"); handleRequestCode(); }}
                disabled={pwLoading}>
                {pwLoading ? <span className="profile-spinner" /> : "Enviar código de verificación"}
              </button>
            </div>
          )}

          {/* SENDING: cargando */}
          {pwStep === "sending" && (
            <div className="profile-form pw-loading-state">
              <span className="profile-spinner profile-spinner--large" />
              <p>Enviando código a tu email...</p>
            </div>
          )}

          {/* CODE: introducir código + nueva contraseña */}
          {pwStep === "code" && (
            <div className="profile-form">
              {pwMsg && (
                <div className={`profile-msg profile-msg--${pwMsg.type}`}>{pwMsg.text}</div>
              )}

              <div className="pw-code-section">
                <label className="pw-code-label">Código de verificación</label>
                <div className="pw-code-inputs" onPaste={handleCodePaste}>
                  {verificationCode.map((digit, i) => (
                    <input key={i} id={`code-${i}`} type="text" inputMode="numeric"
                      maxLength={1} value={digit}
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="pw-code-input" autoFocus={i === 0} />
                  ))}
                </div>
                <div className="pw-code-actions">
                  {countdown > 0 ? (
                    <span className="pw-countdown">Reenviar en {countdown}s</span>
                  ) : (
                    <button className="pw-resend-btn" onClick={handleRequestCode} disabled={pwLoading}>
                      Reenviar código
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Nueva contraseña</label>
                <input type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" minLength={8} />
              </div>

              <div className="profile-field">
                <label>Confirmar contraseña</label>
                <input type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña" />
                {confirmPassword.length > 0 && (
                  <span className={`pw-match ${newPassword === confirmPassword ? "ok" : "fail"}`}>
                    {newPassword === confirmPassword ? "✓ Coinciden" : "✗ No coinciden"}
                  </span>
                )}
              </div>

              <div className="pw-actions-row">
                <button className="profile-btn profile-btn--ghost"
                  onClick={() => { setPwStep("idle"); setPwMsg(null); setVerificationCode(["","","","","",""]); }}>
                  Cancelar
                </button>
                <button className="profile-btn profile-btn--primary"
                  onClick={handleChangePassword} disabled={pwLoading}>
                  {pwLoading ? <span className="profile-spinner" /> : "Cambiar contraseña"}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {pwStep === "success" && (
            <div className="profile-form pw-success">
              <div className="pw-success__icon">✓</div>
              <p className="pw-success__text">Contraseña cambiada correctamente</p>
              <p className="pw-success__sub">Las demás sesiones activas han sido cerradas por seguridad.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}