import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import api from "../../services/api";
import { useAuth } from "../../context/Authcontext";
import logoImg from "../../assets/icons/logo-bw.jpg";
import Icon from "../../components/ui/Icon";
import "./Auth.css";

/**
 * Traduce el fallo a algo que diga la verdad.
 *
 * Antes todo acababa en "email o contraseña incorrectos", incluso
 * cuando la petición no llegaba a salir. Eso mandó a buscar un problema
 * de credenciales donde lo que pasaba era que el servidor del hosting
 * gratuito estaba despertando y la petición se agotaba.
 *
 * Solo el 401 significa de verdad que los datos están mal.
 */
function mensajeDeError(err: unknown): string {
  const e = err as {
    code?: string;
    response?: { status?: number; data?: { message?: string } };
    request?: unknown;
  };

  // Se agotó el tiempo: ni siquiera hubo respuesta.
  if (e?.code === "ECONNABORTED" || e?.code === "ETIMEDOUT") {
    return "El servidor ha tardado demasiado en responder. "
         + "Si es la primera visita del día puede estar arrancando: espera unos segundos y vuelve a intentarlo.";
  }

  // Hubo petición pero no respuesta: sin red, servidor caído o bloqueado.
  if (!e?.response) {
    return "No se ha podido conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.";
  }

  const estado = e.response.status;
  const delServidor = e.response.data?.message;

  if (estado === 401) return "Email o contraseña incorrectos.";
  if (estado === 429) {
    return delServidor
        ?? "Demasiados intentos. Espera unos minutos antes de volver a probar.";
  }
  if (estado === 422) return delServidor ?? "Revisa los datos introducidos.";
  if (estado && estado >= 500) {
    return "El servidor ha devuelto un error. Inténtalo en un momento.";
  }

  return delServidor ?? `No se ha podido iniciar sesión (error ${estado}).`;
}

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [despertando, setDespertando] = useState(false);

  /*
   * Despierta el servidor en cuanto se abre la pantalla.
   *
   * En hosting gratuito el servidor se duerme solo y tarda casi un
   * minuto en levantarse. Lanzando esta petición mientras la persona
   * escribe su correo, para cuando le da a entrar ya está despierto, y
   * el acceso es inmediato en vez de parecer que no funciona.
   *
   * Si falla no se dice nada: es solo para ganar tiempo.
   */
  useEffect(() => {
    let vivo = true;

    // Solo se avisa si tarda de verdad, para no enseñar un cartel en
    // cada carga cuando el servidor ya estaba en pie.
    const aviso = window.setTimeout(() => { if (vivo) setDespertando(true); }, 1200);

    api.get("/ping")
      .catch(() => {})
      .finally(() => {
        window.clearTimeout(aviso);
        if (vivo) setDespertando(false);
      });

    return () => { vivo = false; window.clearTimeout(aviso); };
  }, []);

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
      navigate(user.role === "admin" ? "/admin/users-weight" : "/dashboard", { replace: true });
    } catch (err) {
      setError(mensajeDeError(err));
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
        <div className="auth-card rise rise--1">
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

            {/* Solo aparece si el servidor estaba dormido y tarda en
                levantarse, para que no parezca que algo va mal. */}
            {despertando && !error && (
              <p className="auth-waking">
                <span className="auth-spinner auth-spinner--sm" />
                Levantando el servidor, un momento...
              </p>
            )}

            <button type="submit" className={`btn-primary auth-submit ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Entrar"}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link></p>
            <Link to="/" className="auth-back"><Icon name="arrow-left" size={13} /> Volver a la web</Link>
          </div>
        </div>
      </div>
    </div>
  );
}