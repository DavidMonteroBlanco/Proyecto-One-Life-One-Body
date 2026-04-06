// src/layouts/UserLayout.tsx

import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/Authcontext";
import logoImg from "../assets/icons/logo-bw.jpg";
import "./UserLayout.css";

/* ══════════════════════════════════════════════════════════════════
   SHOOTING STARS — Canvas animation
   ══════════════════════════════════════════════════════════════════ */
interface Star {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  life: number; maxLife: number;
  trail: { x: number; y: number }[];
}

function SidebarStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0 });

  const spawnStar = useCallback(() => {
    const { w, h } = dimRef.current;
    if (w === 0 || h === 0) return;

    const edge = Math.random();
    let x: number, y: number;
    if (edge < 0.6) {
      x = Math.random() * w; y = -2;
    } else if (edge < 0.85) {
      x = w + 2; y = Math.random() * h * 0.5;
    } else {
      x = w * 0.5 + Math.random() * w * 0.5; y = -2;
    }

    const angle = Math.PI * 0.55 + Math.random() * 0.4;
    const speed = 0.3 + Math.random() * 0.7;

    starsRef.current.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.45,
      life: 0,
      maxLife: 120 + Math.random() * 200,
      trail: [],
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimRef.current = { w: rect.width, h: rect.height };
    };

    resize();
    window.addEventListener("resize", resize);

    const spawnInterval = setInterval(() => {
      if (starsRef.current.length < 8) spawnStar();
    }, 800);

    const animate = () => {
      const { w, h } = dimRef.current;
      ctx.clearRect(0, 0, w, h);

      starsRef.current = starsRef.current.filter((star) => {
        star.life++;
        star.x += star.vx;
        star.y += star.vy;

        star.trail.push({ x: star.x, y: star.y });
        if (star.trail.length > 18) star.trail.shift();

        const progress = star.life / star.maxLife;
        let alpha = star.opacity;
        if (progress < 0.1) alpha *= progress / 0.1;
        else if (progress > 0.7) alpha *= (1 - progress) / 0.3;

        if (star.trail.length > 1) {
          for (let i = 1; i < star.trail.length; i++) {
            const t = i / star.trail.length;
            ctx.beginPath();
            ctx.moveTo(star.trail[i - 1].x, star.trail[i - 1].y);
            ctx.lineTo(star.trail[i].x, star.trail[i].y);
            ctx.strokeStyle = `rgba(126, 232, 232, ${alpha * t * 0.4})`;
            ctx.lineWidth = star.size * t * 0.6;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 245, 245, ${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(126, 232, 232, ${alpha * 0.15})`;
        ctx.fill();

        return star.life < star.maxLife && star.x > -20 && star.y < h + 20;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(spawnInterval);
      window.removeEventListener("resize", resize);
    };
  }, [spawnStar]);

  return <canvas ref={canvasRef} className="sidebar__stars-canvas" />;
}

/* ── Ambient floating particles ── */
function AmbientParticles() {
  return (
    <div className="sidebar__ambient" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="sidebar__particle" style={{
          "--x": `${8 + Math.random() * 84}%`,
          "--delay": `${Math.random() * 12}s`,
          "--duration": `${8 + Math.random() * 14}s`,
          "--size": `${1 + Math.random() * 2}px`,
          "--opacity": 0.08 + Math.random() * 0.2,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   NAV LINKS — Simplificado para usuario
   ══════════════════════════════════════════════════════════════════ */
const userLinks = [
  { to: "/dashboard",     icon: "◈", label: "Dashboard",     sub: "Vista general" },
  { to: "/my-tracking",   icon: "◎", label: "Seguimiento",   sub: "Pesajes y evolución" },
  { to: "/my-profile",    icon: "⊕", label: "Mi Perfil",     sub: "Cuenta y seguridad" },
];

const adminLinks = [
  { to: "/admin/workouts",      icon: "◇", label: "Gestión Entrenos",  sub: "Asignar y editar" },
  { to: "/admin/exercises",     icon: "◈", label: "Biblioteca",        sub: "Ejercicios API" },
  { to: "/admin/services",      icon: "▣", label: "Servicios",         sub: "Gestión de oferta" },
  { to: "/admin/collaborators", icon: "◉", label: "Colaboradores",     sub: "Equipo" },
  { to: "/admin/method",        icon: "◎", label: "Método OLOB",       sub: "Contenido editorial" },
  { to: "/admin/settings",      icon: "⊕", label: "Configuración",    sub: "Sistema & ajustes" },
];

/* ── Sidebar Link ── */
function SidebarLink({
  to, icon, label, sub, collapsed,
}: {
  to: string; icon: string; label: string; sub: string; collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? "sidebar-link--active" : ""} ${collapsed ? "sidebar-link--collapsed" : ""}`
      }
      title={collapsed ? label : undefined}
    >
      <span className="sidebar-link__icon">{icon}</span>
      {!collapsed && (
        <span className="sidebar-link__text">
          <span className="sidebar-link__label">{label}</span>
          <span className="sidebar-link__sub">{sub}</span>
        </span>
      )}
      {!collapsed && <span className="sidebar-link__indicator" />}
    </NavLink>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN LAYOUT
   ══════════════════════════════════════════════════════════════════ */
export default function UserLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const firstName = user?.name?.split(" ")[0] || "Usuario";
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className={`user-layout ${collapsed ? "user-layout--collapsed" : ""}`}>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${mobileOpen ? "sidebar--mobile-open" : ""}`}>

        <SidebarStars />
        <AmbientParticles />
        <div className="sidebar__glow" />
        <div className="sidebar__glow sidebar__glow--bottom" />

        {/* ── Header ── */}
        <div className="sidebar__header">
          <button className="sidebar__brand" onClick={() => navigate("/dashboard")}>
            {/* Logo: solo la mascota (perro) recortada desde la parte superior */}
            <div className="sidebar__logo-wrap">
              <img src={logoImg} alt="OLOB" className="sidebar__logo-img" />
              <span className="sidebar__logo-ring" />
            </div>
            {!collapsed && (
              <div className="sidebar__brand-text">
                <span className="sidebar__brand-name">ONE LIFE</span>
                <span className="sidebar__brand-name sidebar__brand-name--accent">ONE BODY</span>
                <span className="sidebar__brand-sub">Fitness Center</span>
              </div>
            )}
          </button>

          <button
            className="sidebar__collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            <span className={`sidebar__collapse-icon ${collapsed ? "sidebar__collapse-icon--flipped" : ""}`}>
              ‹
            </span>
          </button>
        </div>

        {/* ── User card ── */}
        <div className={`sidebar__user-card ${collapsed ? "sidebar__user-card--collapsed" : ""}`}>
          <div className="sidebar__avatar">
            <span className="sidebar__avatar-text">{initials}</span>
            <span className="sidebar__avatar-status" />
          </div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{firstName}</span>
              <span className="sidebar__user-role">
                {isAdmin ? "Administrador" : "Cliente"}
              </span>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar__nav">
          {!collapsed && <div className="sidebar__section-label">Mi Espacio</div>}
          <div className="sidebar__links">
            {userLinks.map((link) => (
              <SidebarLink key={link.to} {...link} collapsed={collapsed} />
            ))}
          </div>

          {isAdmin && (
            <>
              {!collapsed && (
                <div className="sidebar__section-label sidebar__section-label--admin">
                  <span className="sidebar__admin-dot" />
                  Administración
                </div>
              )}
              {collapsed && <div className="sidebar__divider" />}
              <div className="sidebar__links">
                {adminLinks.map((link) => (
                  <SidebarLink key={link.to} {...link} collapsed={collapsed} />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* ── Footer ── */}
        <div className="sidebar__footer">
          <a href="/" className="sidebar__back-web" title="Volver a la web">
            <span className="sidebar__back-icon">←</span>
            {!collapsed && <span>Volver a la web</span>}
          </a>
          <button className="sidebar__logout" onClick={handleLogout} title="Cerrar sesión">
            <span className="sidebar__logout-icon">⏻</span>
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
          {!collapsed && (
            <span className="sidebar__version">v1.0 · One Life One Body</span>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="user-layout__main">
        <header className="topbar">
          <button className="topbar__menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            <span /><span /><span />
          </button>
          <div className="topbar__brand">
            <div className="topbar__logo-wrap">
              <img src={logoImg} alt="OLOB" className="topbar__logo" />
            </div>
            <span className="topbar__title">ONE LIFE ONE BODY</span>
          </div>
          <div className="topbar__avatar">
            <span>{initials}</span>
          </div>
        </header>

        <main className="user-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}