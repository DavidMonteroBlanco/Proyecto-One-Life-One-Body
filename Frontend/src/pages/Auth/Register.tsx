import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { register } from "../../services/auth";
import { useAuth } from "../../context/Authcontext";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./Auth.css";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: { length: boolean; uppercase: boolean; lowercase: boolean; number: boolean; special: boolean };
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const levels = [
    { label: "",           color: "transparent" },
    { label: "Muy débil",  color: "#e25555" },
    { label: "Débil",      color: "#e28855" },
    { label: "Aceptable",  color: "#e2c455" },
    { label: "Segura",     color: "#55b8e2" },
    { label: "Muy segura", color: "#55e2a0" },
  ];
  return { score, ...levels[score], checks };
}

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    password_confirmation: "", phone: "", birth_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwStrength, setPwStrength] = useState<PasswordStrength>(getPasswordStrength(""));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "password") setPwStrength(getPasswordStrength(value));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validaciones con Expresiones Regulares ──
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PHONE_REGEX = /^(\+34\s?)?\d{3}\s?\d{2,3}\s?\d{2,3}\s?\d{0,2}$/;
    const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,60}$/;

    if (!NAME_REGEX.test(form.name.trim())) {
      setError("El nombre solo puede contener letras y espacios (2-60 caracteres).");
      return;
    }

    if (!EMAIL_REGEX.test(form.email)) {
      setError("Introduce un email válido (ej: tu@email.com).");
      return;
    }

    if (form.phone && !PHONE_REGEX.test(form.phone.replace(/\s/g, ""))) {
      setError("Teléfono no válido. Usa formato español (ej: +34 600 000 000).");
      return;
    }

    if (form.password !== form.password_confirmation) { setError("Las contraseñas no coinciden."); return; }
    if (pwStrength.score < 3) { setError("La contraseña no es suficientemente segura."); return; }
    setLoading(true);
    setError("");
    try {
      const { user } = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        phone: form.phone || undefined,
        birth_date: form.birth_date || undefined,
      });
      setUser(user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0] as string[];
        setError(first[0]);
      } else {
        setError(err?.response?.data?.message ?? "Ha ocurrido un error. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
      </div>

      <div className="auth-container auth-container--wide">
        <motion.div className="auth-card" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className="auth-card__bg-logo">
            <img src={logoImg} alt="" aria-hidden="true" />
          </div>

          <div className="auth-card__header">
            <p className="section-label">Empieza hoy</p>
            <h1 className="auth-card__title">Crea tu<br />cuenta</h1>
            <p className="auth-card__sub">Tu evolución empieza aquí. Registra tu perfil y accede a todo.</p>
          </div>

          <form className="auth-form auth-form--grid" onSubmit={handleSubmit}>

            <div className="auth-field auth-field--full">
              <label htmlFor="name">Nombre completo</label>
              <input id="name" name="name" type="text" autoComplete="name"
                placeholder="David Montero" value={form.name} onChange={handleChange} required />
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email"
                placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="auth-field">
              <label htmlFor="phone">Teléfono</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel"
                placeholder="+34 600 000 000" value={form.phone} onChange={handleChange} />
            </div>

            <div className="auth-field auth-field--full">
              <label htmlFor="birth_date">Fecha de nacimiento</label>
              <input id="birth_date" name="birth_date" type="date"
                value={form.birth_date} onChange={handleChange} required />
            </div>

            <div className="auth-field auth-field--full">
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" autoComplete="new-password"
                placeholder="Mínimo 8 caracteres" value={form.password} onChange={handleChange} required minLength={8} />
              {form.password.length > 0 && (
                <div className="pw-strength">
                  <div className="pw-strength__bar">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="pw-strength__segment"
                        style={{ background: pwStrength.score >= i ? pwStrength.color : "var(--border)", transition: "background 0.3s" }} />
                    ))}
                  </div>
                  <span className="pw-strength__label" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                  <ul className="pw-checklist">
                    {([
                      [pwStrength.checks.length,    "Mínimo 8 caracteres"],
                      [pwStrength.checks.uppercase,  "Una mayúscula"],
                      [pwStrength.checks.lowercase,  "Una minúscula"],
                      [pwStrength.checks.number,     "Un número"],
                      [pwStrength.checks.special,    "Un símbolo (!@#...)"],
                    ] as [boolean, string][]).map(([ok, text]) => (
                      <li key={text} className={`pw-checklist__item ${ok ? "ok" : ""}`}>
                        <span className="pw-checklist__icon">{ok ? "✓" : "○"}</span>{text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="auth-field auth-field--full">
              <label htmlFor="password_confirmation">Confirmar contraseña</label>
              <input id="password_confirmation" name="password_confirmation" type="password"
                autoComplete="new-password" placeholder="Repite la contraseña"
                value={form.password_confirmation} onChange={handleChange} required />
              {form.password_confirmation.length > 0 && (
                <span className={`pw-match ${form.password === form.password_confirmation ? "ok" : "fail"}`}>
                  {form.password === form.password_confirmation ? "✓ Las contraseñas coinciden" : "✗ No coinciden"}
                </span>
              )}
            </div>

            <p className="auth-notice auth-field--full">
              Al registrarte aceptas que tus datos sean usados para el seguimiento de tu progreso físico por parte del entrenador.
            </p>

            {error && <p className="auth-error auth-field--full">{error}</p>}

            <button type="submit"
              className={`btn-primary auth-submit auth-field--full ${loading ? "loading" : ""}`}
              disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Crear cuenta"}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión</Link></p>
            <Link to="/" className="auth-back">← Volver a la web</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}