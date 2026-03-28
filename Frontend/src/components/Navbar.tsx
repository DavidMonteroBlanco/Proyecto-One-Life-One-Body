import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { getToken, clearToken, saveUser, clearUser } from "../auth";
import { setAuthToken } from "../api";
import { fetchMe } from "../authSession";
import "./Navbar.css";

type MeUser = {
  name?: string;
  role?: "admin" | "user" | string;
};

const THEME_KEY = "olob_theme";

function applyTheme(mode: "light" | "dark") {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem(THEME_KEY, mode);
}

function getInitialTheme(): "light" | "dark" {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return "dark";
}

// ── Partículas decorativas ─────────────────────────────────────────
function NavParticles() {
  return (
    <div className="nav-particles" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="nav-particle" style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

// ── Icono animado hamburguesa → X ──────────────────────────────────
function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className={`nav-hamburger ${open ? "nav-hamburger--open" : ""}`}>
      <span /><span /><span />
    </span>
  );
}

// ── Enlace del menú con animación stagger ─────────────────────────
function NavItem({
  label,
  sublabel,
  icon,
  admin,
  delay,
  onClick,
}: {
  label: string;
  sublabel?: string;
  icon: string;
  admin?: boolean;
  delay: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-item ${admin ? "nav-item--admin" : ""}`}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
      onClick={onClick}
    >
      <span className="nav-item__icon">{icon}</span>
      <span className="nav-item__text">
        <span className="nav-item__label">{label}</span>
        {sublabel && <span className="nav-item__sub">{sublabel}</span>}
      </span>
      <span className="nav-item__arrow">→</span>
    </button>
  );
}

export default function Navbar() {
  const nav = useNavigate();
  const [user, setUser] = useState<MeUser | null>(null);
  const token = getToken();
  const admin = useMemo(() => user?.role === "admin", [user]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme());
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dispara la animación de entrada al montar
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("olob_theme", theme);
  }, [theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!token) { setUser(null); return; }
    fetchMe()
      .then((u: any) => { setUser(u); saveUser(u); })
      .catch(() => setUser(null));
  }, [token]);

  // Cierra menú al click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  function handleLogout() {
    clearToken(); clearUser(); setAuthToken(null); setUser(null);
    setMenuOpen(false);
    nav("/login");
  }

  function go(path: string) {
    setMenuOpen(false);
    nav(path);
  }

  const userLinks = [
    { label: "Dashboard", sublabel: "Vista general", icon: "◈", path: "/" },
    { label: "Entrenamientos", sublabel: "Tus rutinas activas", icon: "⚡", path: "/workouts" },
    { label: "Ejercicios", sublabel: "Biblioteca API externa", icon: "◎", path: "/exercises" },
    { label: "Favoritos", sublabel: "Guardados", icon: "♦", path: "/saved-exercises" },
  ];

  const adminLinks = [
    { label: "Servicios", sublabel: "Gestión de oferta", icon: "◇", path: "/admin/services" },
    { label: "Colaboradores", sublabel: "Equipo", icon: "◉", path: "/admin/collaborators" },
    { label: "Método OLOB", sublabel: "Contenido editorial", icon: "◈", path: "/admin/method" },
    { label: "Configuración", sublabel: "Sistema & ajustes", icon: "⊕", path: "/admin/settings" },
  ];

  return (
    <header
      ref={menuRef}
      className={`olob-nav ${mounted ? "olob-nav--in" : ""}`}
    >
      <NavParticles />

      {/* ── Barra principal ── */}
      <div className="olob-nav__bar">

        {/* Logo */}
        <button className="olob-nav__brand" onClick={() => go("/")}>
          <div className="olob-nav__logo-wrap">
            <img
              src="/LOGO-OLB CHICA.jpg"
              alt="OLOB"
              className="olob-nav__logo-img"
            />
            <span className="olob-nav__logo-ring" />
          </div>
          <div className="olob-nav__brand-text">
            <span className="olob-nav__brand-name">ONE LIFE ONE BODY</span>
            <span className="olob-nav__brand-sub">Internal Panel</span>
          </div>
        </button>

        {/* Acciones */}
        <div className="olob-nav__actions">

          {token && (
            <div className="olob-nav__user-chip">
              <span className="olob-nav__user-dot" />
              <span className="olob-nav__user-name">
                {user?.name ?? "Usuario"}
                {admin && <span className="olob-nav__role-badge">ADMIN</span>}
              </span>
            </div>
          )}

          {/* Toggle tema */}
          <button
            className="olob-nav__icon-btn"
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            title="Cambiar tema"
          >
            <span className={`olob-nav__theme-icon ${theme === "dark" ? "olob-nav__theme-icon--dark" : ""}`}>
              {theme === "dark" ? "☾" : "☀"}
            </span>
          </button>

          {/* Logout */}
          {token ? (
            <button className="olob-nav__ghost-btn" onClick={handleLogout}>
              Salir
            </button>
          ) : (
            <Link to="/login" className="olob-nav__cta-btn">
              Entrar
            </Link>
          )}

          {/* Menú toggle */}
          {token && (
            <button
              className={`olob-nav__menu-btn ${menuOpen ? "olob-nav__menu-btn--active" : ""}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menú de navegación"
            >
              <MenuIcon open={menuOpen} />
              <span>Menú</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Menú desplegable ── */}
      {token && (
        <div className={`olob-nav__dropdown ${menuOpen ? "olob-nav__dropdown--open" : ""}`}>
          <div className="olob-nav__dropdown-inner">

            {/* Sección usuario */}
            <div className="olob-nav__section">
              <div className="olob-nav__section-label">Navegación</div>
              <div className="olob-nav__links">
                {userLinks.map((l, i) => (
                  <NavItem
                    key={l.path}
                    label={l.label}
                    sublabel={l.sublabel}
                    icon={l.icon}
                    delay={i * 55}
                    onClick={() => go(l.path)}
                  />
                ))}
              </div>
            </div>

            {/* Sección admin */}
            {admin && (
              <div className="olob-nav__section">
                <div className="olob-nav__section-label olob-nav__section-label--admin">
                  <span className="olob-nav__admin-dot" />
                  Zona Administración
                </div>
                <div className="olob-nav__links">
                  {adminLinks.map((l, i) => (
                    <NavItem
                      key={l.path}
                      label={l.label}
                      sublabel={l.sublabel}
                      icon={l.icon}
                      admin
                      delay={userLinks.length * 55 + i * 55}
                      onClick={() => go(l.path)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Footer del menú */}
            <div className="olob-nav__dropdown-footer">
              <span>© One Life One Body</span>
              <span className="olob-nav__version">v1.0 · Panel interno</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}