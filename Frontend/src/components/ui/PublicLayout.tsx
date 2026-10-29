import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Icon from "./Icon";
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

      {/* Barra de progreso de lectura. Va ligada al scroll por CSS:
          no cuesta ni un listener de JavaScript. */}
      <div className="read-progress" aria-hidden="true" />

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
                <Icon name="instagram" size={18} />
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
            <NavLink to="/access" className="btn-primary navbar__mobile-cta">
              Área cliente
            </NavLink>
          </div>
        </nav>
      )}

      <main className="page-enter" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  );
}