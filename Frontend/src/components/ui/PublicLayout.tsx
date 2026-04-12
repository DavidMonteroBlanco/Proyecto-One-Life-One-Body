import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./PublicLayout.css";

const AUTH_ROUTES = ["/login", "/register", "/access", "/forgot-password"];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const navLinks = [
    { label: "Método",           href: "/#metodo" },
    { label: "Servicios",        href: "/#servicios" },
    { label: "Entrenos Online",  href: "/entrenos-online" },
    { label: "Testimonios",      href: "/#testimonios" },
    { label: "Contacto",         href: "/#contacto" },
  ];

  return (
    <div className="public-layout">

      {/* Navbar solo en páginas que NO son auth */}
      {!isAuthPage && (
        <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
          <div className="navbar__inner">

            <a href="/" className="navbar__logo">
              <img src={logoImg} alt="One Life One Body" className="navbar__logo-img" />
            </a>

            <ul className="navbar__links">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="navbar__link">{l.label}</a>
                </li>
              ))}
            </ul>

            <div className="navbar__actions">
              <a
                href="https://www.instagram.com/one.life.one.body.benidorm/"
                target="_blank" rel="noreferrer"
                className="navbar__ig" aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <NavLink to="/access" className="btn-primary navbar__cta">Área cliente</NavLink>
              <button
                className={`navbar__burger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menú"
              >
                <span /><span /><span />
              </button>
            </div>
          </div>

          <div className={`navbar__mobile ${menuOpen ? "navbar__mobile--open" : ""}`}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="navbar__mobile-link">{l.label}</a>
            ))}
            <NavLink to="/access" className="btn-primary" style={{ marginTop: "1rem" }}>
              Área cliente
            </NavLink>
          </div>
        </nav>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}