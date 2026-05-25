import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./PublicLayout.css";

const NO_NAVBAR_ROUTES = ["/login", "/register", "/access", "/forgot-password"];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const hideNavbar = NO_NAVBAR_ROUTES.includes(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleHashLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    if (!href.startsWith("/#")) return;
    e.preventDefault();
    const id = href.slice(2);
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 350);
    }
  };

  const navLinks = [
    { label: "Método",          href: "/#metodo" },
    { label: "Servicios",       href: "/#servicios" },
    { label: "Entrenos Online", href: "/entrenos-online" },
    { label: "Testimonios",     href: "/#testimonios" },
    { label: "Contacto",        href: "/#contacto" },
  ];

  return (
    <div className="public-layout">

      {!hideNavbar && (
        <nav className={`navbar ${scrolled || menuOpen ? "navbar--scrolled" : ""}`}>
          <div className="navbar__inner">

            <a href="/" className="navbar__logo">
              <img src={logoImg} alt="One Life One Body" className="navbar__logo-img" />
            </a>

            <ul className="navbar__links">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="navbar__link" onClick={(e) => handleHashLink(e, l.href)}>{l.label}</a>
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
              <a key={l.href} href={l.href} className="navbar__mobile-link" onClick={(e) => handleHashLink(e, l.href)}>{l.label}</a>
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