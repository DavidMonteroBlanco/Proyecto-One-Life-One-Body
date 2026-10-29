// src/layouts/UserLayout.tsx

import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/Authcontext";
import Icon from "../components/ui/Icon";
import NotificationBell from "../components/ui/NotificationBell";
import type { IconName } from "../components/ui/Icon";
import logoImg from "../assets/icons/logo-bw.jpg";
import "./UserLayout.css";

interface Star { x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number; maxLife: number; trail: { x: number; y: number }[]; }

/* Debajo de 900 px la barra lateral está oculta: cualquier animación
   dentro de ella es trabajo tirado, y justo en los aparatos con menos
   potencia. Lo mismo si el sistema pide reducir movimiento. */
function sidebarDecorAllowed() {
  return (
    typeof window !== "undefined" &&
    window.innerWidth > 900 &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function SidebarStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0 });

  const spawnStar = useCallback(() => {
    const { w, h } = dimRef.current; if (w === 0 || h === 0) return;
    const edge = Math.random(); let x: number, y: number;
    if (edge < 0.6) { x = Math.random() * w; y = -2; } else if (edge < 0.85) { x = w + 2; y = Math.random() * h * 0.5; } else { x = w * 0.5 + Math.random() * w * 0.5; y = -2; }
    const angle = Math.PI * 0.55 + Math.random() * 0.4; const speed = 0.3 + Math.random() * 0.7;
    starsRef.current.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 1 + Math.random() * 1.5, opacity: 0.15 + Math.random() * 0.45, life: 0, maxLife: 120 + Math.random() * 200, trail: [] });
  }, []);

  useEffect(() => {
    if (!sidebarDecorAllowed()) return;

    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect(); if (!rect) return;
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimRef.current = { w: rect.width, h: rect.height };
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnInterval = setInterval(() => { if (starsRef.current.length < 6) spawnStar(); }, 900);

    // Una sola llamada a stroke() por estela. La versión anterior
    // dibujaba cada tramo por separado: 8 estrellas × 18 tramos eran
    // 144 stroke() y 144 cadenas de color por fotograma.
    ctx.lineCap = "round";

    const animate = () => {
      const { w, h } = dimRef.current;
      ctx.clearRect(0, 0, w, h);

      starsRef.current = starsRef.current.filter((star) => {
        star.life++; star.x += star.vx; star.y += star.vy;
        star.trail.push({ x: star.x, y: star.y });
        if (star.trail.length > 12) star.trail.shift();

        const progress = star.life / star.maxLife;
        let alpha = star.opacity;
        if (progress < 0.1) alpha *= progress / 0.1;
        else if (progress > 0.7) alpha *= (1 - progress) / 0.3;

        if (star.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(star.trail[0].x, star.trail[0].y);
          for (let i = 1; i < star.trail.length; i++) ctx.lineTo(star.trail[i].x, star.trail[i].y);
          ctx.strokeStyle = `rgba(111,222,220,${(alpha * 0.32).toFixed(3)})`;
          ctx.lineWidth = star.size * 0.6;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,245,245,${alpha.toFixed(3)})`;
        ctx.fill();

        return star.life < star.maxLife && star.x > -20 && star.y < h + 20;
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Con la pestaña de fondo no se dibuja nada.
    const onVisibility = () => {
      cancelAnimationFrame(rafRef.current);
      if (!document.hidden) rafRef.current = requestAnimationFrame(animate);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(spawnInterval);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [spawnStar]);

  return <canvas ref={canvasRef} className="sidebar__stars-canvas" />;
}

function AmbientParticles() {
  // Cada partícula es una capa que el navegador compone aparte.
  // Veinte de ellas en un móvil es memoria de vídeo a cambio de nada,
  // porque allí la barra lateral ni se ve.
  if (!sidebarDecorAllowed()) return null;

  return (
    <div className="sidebar__ambient" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="sidebar__particle" style={{ "--x": `${8 + Math.random() * 84}%`, "--delay": `${Math.random() * 12}s`, "--duration": `${8 + Math.random() * 14}s`, "--size": `${1 + Math.random() * 2}px`, "--opacity": 0.08 + Math.random() * 0.2 } as React.CSSProperties} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   NAV LINKS — Solo lo que se usa
   ══════════════════════════════════════════════════════════════════ */
const userLinks: SidebarItem[] = [
  { to: "/dashboard",        icon: "home",     label: "Panel",        sub: "Vista general" },
  { to: "/my-tracking",      icon: "chart",    label: "Seguimiento",  sub: "Pesajes y evolución" },
  { to: "/my-workouts",      icon: "dumbbell", label: "Mis entrenos", sub: "Sesiones y pesos" },
  { to: "/my-diet",          icon: "plate",    label: "Mi dieta",     sub: "Plan de alimentación" },
  { to: "/my-appointments",  icon: "calendar", label: "Reservas",     sub: "Pesaje semanal" },
  { to: "/my-profile",       icon: "user",     label: "Mi perfil",    sub: "Cuenta y seguridad" },
];

const adminLinks: SidebarItem[] = [
  { to: "/admin/users-weight", icon: "scale",    label: "Usuarios y pesajes", sub: "Gestionar clientes" },
  { to: "/admin/workouts",     icon: "dumbbell", label: "Entrenos",           sub: "Sesiones y pesos" },
  { to: "/admin/diets",        icon: "plate",    label: "Dietas",             sub: "Planes de alimentación" },
  { to: "/admin/nutricion-ia", icon: "chat",     label: "Nutrición IA",       sub: "Crear dietas hablando" },
  { to: "/admin/incidents",    icon: "alert",    label: "Incidencias",        sub: "Envíos que han fallado" },
  { to: "/admin/services",     icon: "settings", label: "Servicios",          sub: "Gestión de oferta" },
];

type SidebarItem = { to: string; icon: IconName; label: string; sub: string };

function SidebarLink({ to, icon, label, sub, collapsed }: SidebarItem & { collapsed: boolean }) {
  return (<NavLink to={to} className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link--active" : ""} ${collapsed ? "sidebar-link--collapsed" : ""}`} title={collapsed ? label : undefined}>
    <span className="sidebar-link__icon"><Icon name={icon} size={18} /></span>
    {!collapsed && (<span className="sidebar-link__text"><span className="sidebar-link__label">{label}</span><span className="sidebar-link__sub">{sub}</span></span>)}
    {!collapsed && <span className="sidebar-link__indicator" />}
  </NavLink>);
}

export default function UserLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location]);
  useEffect(() => { const r = () => { if (window.innerWidth > 900) setMobileOpen(false); }; window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

  const handleLogout = async () => { await logout(); navigate("/login"); };
  const firstName = user?.name?.split(" ")[0] || "Usuario";
  const initials = user?.name ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <div className={`user-layout ${collapsed ? "user-layout--collapsed" : ""}`}>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar--mobile-open" : ""}`}>
        <SidebarStars /><AmbientParticles /><div className="sidebar__glow" /><div className="sidebar__glow sidebar__glow--bottom" />
        <div className="sidebar__header">
          <button className="sidebar__brand" onClick={() => navigate("/dashboard")}>
            <div className="sidebar__logo-wrap"><img src={logoImg} alt="OLOB" className="sidebar__logo-img" /><span className="sidebar__logo-ring" /></div>
            {!collapsed && (<div className="sidebar__brand-text"><span className="sidebar__brand-name">ONE LIFE</span><span className="sidebar__brand-name sidebar__brand-name--accent">ONE BODY</span><span className="sidebar__brand-sub">Fitness Center</span></div>)}
          </button>
          <button className="sidebar__collapse-btn" onClick={() => setCollapsed((v) => !v)} title={collapsed ? "Expandir" : "Colapsar"}><span className={`sidebar__collapse-icon ${collapsed ? "sidebar__collapse-icon--flipped" : ""}`}><Icon name="chevron-left" size={16} /></span></button>
        </div>
        <div className={`sidebar__user-card ${collapsed ? "sidebar__user-card--collapsed" : ""}`}>
          <div className="sidebar__avatar"><span className="sidebar__avatar-text">{initials}</span><span className="sidebar__avatar-status" /></div>
          {!collapsed && (<div className="sidebar__user-info"><span className="sidebar__user-name">{firstName}</span><span className="sidebar__user-role">{isAdmin ? "Administrador" : "Cliente"}</span></div>)}
        </div>
        <nav className="sidebar__nav">
          {!collapsed && <div className="sidebar__section-label">Mi espacio</div>}
          <div className="sidebar__links">{userLinks.map((l) => <SidebarLink key={l.to} {...l} collapsed={collapsed} />)}</div>
          {isAdmin && (<>
            {!collapsed && (<div className="sidebar__section-label sidebar__section-label--admin"><span className="sidebar__admin-dot" />Administración</div>)}
            {collapsed && <div className="sidebar__divider" />}
            <div className="sidebar__links">{adminLinks.map((l) => <SidebarLink key={l.to} {...l} collapsed={collapsed} />)}</div>
          </>)}
        </nav>
        <div className="sidebar__footer">
          <a href="/" className="sidebar__back-web" title="Volver a la web"><span className="sidebar__back-icon"><Icon name="arrow-left" size={15} /></span>{!collapsed && <span>Volver a la web</span>}</a>
          <button className="sidebar__logout" onClick={handleLogout} title="Cerrar sesión"><span className="sidebar__logout-icon"><Icon name="logout" size={15} /></span>{!collapsed && <span>Cerrar sesión</span>}</button>
          {!collapsed && <span className="sidebar__version">v1.0 · One Life One Body</span>}
        </div>
      </aside>
      <div className="user-layout__main">
        <header className="topbar">
          <button className="topbar__menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><span /><span /><span /></button>
          <div className="topbar__brand"><div className="topbar__logo-wrap"><img src={logoImg} alt="OLOB" className="topbar__logo" /></div><span className="topbar__title">ONE LIFE ONE BODY</span></div>
          <div className="topbar__right">
            <NotificationBell />
            <div className="topbar__avatar"><span>{initials}</span></div>
          </div>
        </header>
        <main className="user-layout__content" key={location.pathname}><Outlet /></main>
      </div>
    </div>
  );
}