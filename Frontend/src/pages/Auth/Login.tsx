import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { login } from "../../services/auth";
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

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user } = await login(form);
      setUser(user);
      navigate(user.role === "admin" ? "/admin/workouts" : "/dashboard", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Email o contraseña incorrectos.";
      setError(msg);
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

      <div className="auth-container">
        <motion.div className="auth-card" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className="auth-card__bg-logo">
            <img src={logoImg} alt="" aria-hidden="true" />
          </div>

          <div className="auth-card__header">
            <p className="section-label">Área cliente</p>
            <h1 className="auth-card__title">Bienvenido<br />de vuelta</h1>
            <p className="auth-card__sub">Accede a tu historial, tus rutinas y tu evolución.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email"
                placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" autoComplete="current-password"
                placeholder="••••••••" value={form.password} onChange={handleChange} required />
              <Link to="/forgot-password" className="auth-forgot">¿Has olvidado tu contraseña?</Link>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className={`btn-primary auth-submit ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Entrar"}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link></p>
            <Link to="/" className="auth-back">← Volver a la web</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}